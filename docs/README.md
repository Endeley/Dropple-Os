# Dropple OS Documentation (Single File)

This is the **authoritative, single-file documentation** for Dropple OS — an **event-sourced, branch-aware, collaborative design operating system**. Every other doc points back here.

---

## 1) Public Overview

### What Is Dropple OS?
Dropple OS is a **deterministic design platform** that lets teams design, animate, collaborate, branch ideas, merge changes, and export code — safely.

**Why it’s different**
- Every change is recorded as an event
- You can branch and merge like Git
- You preview merges before applying them
- You see exact export code *before* it changes
- Collaboration is permission-safe and server-enforced

**How it works (simplified)**
```
User action → Event → State rebuilt → Canvas updates → Exportable output
```
Nothing mutates silently. Everything is replayable, undoable, auditable. Built for **long-lived projects**, not disposable designs.

---

## 2) Architecture (Internal)

> State is a consequence, not a source of truth. Events are the only source of truth.

**High-Level Flow**
```
UI
↓
MessageBus
↓
Dispatcher (single mutation gate)
↓
Reducers (pure)
↓
Runtime State
↓
Zustand (render mirror)
```
No layer may bypass the Dispatcher.

**Event Sourcing**
```
initialState → apply event 1 → apply event 2 → apply event 3 → currentState
```
Replay must always produce the same result.

**Branching & Merge**
- Branches are logical event streams
- Merge is explicit and previewable
- Merge preview never mutates real state
```
Branch A events ─┐
                 ├─► mergePlan → simulateMergeState (NO mutation)
Branch B events ─┘
       │                 │                 │
       ▼                 ▼                 ▼
   Event Diff       Visual Diff       Export Diff
```

**Timeline & Animation**
- Preview = read-only sampling (AnimatedRuntimeStore)
- Commit = reducer events
- Timeline data is serializable
- Phase 4 metadata only: schema in core/animation/AnimationSchema.js and reducer wiring in core/events/reducers/animationReducers.js (no preview/eval)

**Export Trust Chain**
```
state → exportMotion(state, format) → normalized output → before/after diff
```
If export cannot be diffed, it cannot be trusted.

**Collaboration Model**
- Remote events: Convex append → streamEvents → local dispatcher
- Presence/cursors/intent: Convex presence tables → UI overlays (ephemeral)
- Reducers never handle auth/identity

**Persistence**
- Snapshot save/load
- Append-only events
- Strict schema; IDs not regenerated
- Autosave is debounced and skipped on runtime error

**Security & Permissions**
- Roles: owner/editor/viewer
- Server-side permission guards (Convex)
- Client UX guards are advisory only

**Stability & Recovery**
- Global and editor error boundaries
- Dispatcher try/catch with rollback
- Autosave paused on error
- No partial commits

**Performance**
- Guarded layout pass
- Memoized node rendering
- Throttled animation, timeline preview, and collab signals
- Perf tracker + optional HUD (avg/max/count)

**Absolute Flow (one line)**
```
Intent → Event → Reducer → State → Export → Diff → Trust
```

---

## 3) Rules of Dropple OS (Law)

### Absolute Invariants
- Replay must always work
- Undo must always work
- Merge must be previewable
- Export must be deterministic
- Permissions must be server-enforced

### Forbidden Actions
- Mutating Zustand directly
- Mutating state in components
- Side effects in reducers
- UI-only security
- Silent data fixes

### Authority Chain
Events → Reducers → Dispatcher → Server  
Breaking this chain is a hard stop.

---

## 4) Failure Modes & Recovery

Dropple OS is designed to **fail safely**.

**UI Crash**
```
Component error → GlobalErrorBoundary → User recovery UI
```
State is preserved.

**Canvas Crash**
```
Renderer error → EditorErrorBoundary → resetRuntimeState()
```
Only the editor resets.

**Reducer / Event Error**
```
dispatch(event) → error → rollback
```
No partial state commits.

**Persistence Failure**
```
runtimeError === true → autosave skipped
```
Broken state is never saved.

**Collaboration Permission Failure**
```
remote event → server permission check → reject
```
Reducers never see invalid data.

---

## 5) Contributor Onboarding (Developers)

Before writing code, understand:
- You never mutate state directly
- You never bypass the dispatcher
- You never trust the UI for security
- You never break replay

**Folder Responsibilities**
```
core/     → events & reducers
engine/   → layout & constraints
runtime/  → dispatcher & history
ui/       → canvas & panels
timeline/ → animation model
export/   → deterministic exporters
convex/   → persistence & auth
docs/     → authoritative documentation
```

**Where mutation is allowed**
| Layer      | Mutates State |
|------------|---------------|
| UI         | ❌ |
| Sessions   | ❌ |
| Dispatcher | ✅ |
| Reducers   | ❌ |
| Convex     | ✅ |

If you can’t place a change in this table, stop and rethink.

---

## 6) How to Add a New Tool Safely

Example: Rotate Tool

**Step 1 — Define the Event**
```
NODE_ROTATE { id, angle }
```

**Step 2 — Reducer (Pure)**
No side effects. No DOM. No stores.

**Step 3 — Input Session**
- Track intent only
- Emit event on commit

**Step 4 — Dispatcher**
- Guards
- History
- Optional animation

**Step 5 — Preview (Optional)**
Visual only. No mutation.

**Step 6 — Export**
- Update CSS / WAAPI exporters
- Ensure deterministic output
- Verify export diff

**Step 7 — Permissions**
- Viewer blocked
- Server enforced

If any step is skipped, the tool is invalid.

---

## 7) Quick Reference: Principles
- Events are law. Reducers are pure. Dispatcher is the gate. Server is authority. Replay is sacred.
- If export cannot be diffed, it cannot be trusted.
- If the server didn’t allow it, it didn’t happen.
- Crashes are acceptable. Corruption is not.

This single file is the contract. If a feature or change cannot be explained here, it does **not belong** in Dropple OS.
