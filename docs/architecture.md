# Dropple OS Architecture

> State is a consequence, not a source of truth. Events are the only source of truth.

## High-Level Flow

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

## Event Sourcing

```
initialState
→ apply event 1
→ apply event 2
→ apply event 3
→ currentState
```

Replay must always produce the same result.

## Branching & Merge
- Branches are logical event streams
- Merge is explicit and previewable
- Merge preview never mutates real state

Preview path:
```
Branch A events ─┐
                 ├─► mergePlan → simulateMergeState (NO mutation)
Branch B events ─┘
       │                 │                 │
       ▼                 ▼                 ▼
   Event Diff       Visual Diff       Export Diff
```

## Timeline & Animation
- Preview = read-only sampling (AnimatedRuntimeStore)
- Commit = reducer events
- Timeline data is serializable

## Export Trust Chain

```
state
→ exportMotion(state, format)
→ normalized output
→ before/after diff
```

If export cannot be diffed, it cannot be trusted.

## Collaboration Model
- Remote events: Convex append → streamEvents → local dispatcher
- Presence/cursors/intent: Convex presence tables → UI overlays (ephemeral)
- Reducers never handle auth/identity

## Persistence
- Snapshot save/load
- Append-only events
- Strict schema; IDs not regenerated
- Autosave is debounced and skipped on runtime error

## Security & Permissions
- Roles: owner/editor/viewer
- Server-side permission guards (Convex)
- Client UX guards are advisory only

## Stability & Recovery
- Global and editor error boundaries
- Dispatcher try/catch with rollback
- Autosave paused on error
- No partial commits

## Performance
- Guarded layout pass
- Memoized node rendering
- Throttled animation, timeline preview, and collab signals
- Perf tracker + optional HUD (avg/max/count)

## Absolute Flow (one line)

```
Intent → Event → Reducer → State → Export → Diff → Trust
```
