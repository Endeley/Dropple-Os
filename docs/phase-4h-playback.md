# Phase 4H — Playback Engine
Architecture Lock (Authoritative)

## 1) Phase Intent (Non-Negotiable)

Phase 4H introduces time-based animation playback
without breaking determinism, replay, or export trust.

Playback is runtime behavior, not design truth.

## 2) Core Principle

Playback is illusion. Authoring is truth. Export is proof.

Playback must:
- Never mutate design state
- Never emit events
- Never write to persistence
- Never affect undo / redo
- Never affect replay output

## 3) Playback vs Preview (Critical Distinction)

Aspect | Preview (4C) | Playback (4H)
--- | --- | ---
Time source | User-controlled (scrub) | Clock-driven
Writes to runtime | ❌ | ❌
Writes to animated store | ✅ | ✅
Dispatches events | ❌ | ❌
Persists state | ❌ | ❌
Affects export | ❌ | ❌

Playback extends preview; it does not replace it.

## 4) Authoritative Inputs

Playback reads only:
- state.timeline.animations
- getRuntimeState()

Playback never reads:
- UI state
- DOM state
- Animated store state

## 5) Authoritative Outputs

Playback may write only to:
- useAnimatedRuntimeStore

No other store is permitted.

## 6) Execution Model

Playback Loop
- Uses requestAnimationFrame
- Computes timeMs relative to start
- Calls pure evaluation
  - evaluateAnimationTimeline({ animations, timeMs })

Cancellation
- Playback must be cancelable
- Starting playback cancels:
  - Preview
  - Previous playback

## 7) No Commit Rule (Absolute)

Playback must never:
- Call dispatch
- Call commit
- Push history
- Emit events

If playback changes truth, Phase 4H has failed.

## 8) Replay Safety

During replay:
- runtimeState.__isReplaying === true

Playback must:
- Not start
- Immediately cancel if active

Replay must reconstruct design state only.

## 9) Workspace Gating

Playback UI appears only when:
- workspace.capabilities.animation === true

Readonly workspaces:
- Playback allowed (view-only)
- Authoring still blocked

## 10) Export Isolation

Playback does not influence:
- Export output
- Export diff
- Merge preview

Exports always use design truth only.

## 11) Failure Modes & Recovery

Allowed:
- Dropped frames
- Paused playback
- User interruption

Forbidden:
- Partial commits
- State drift
- Hidden mutations

If playback crashes:
- Cancel animation
- Clear animated store
- Leave design state intact

## 12) Phase 4H Non-Goals (Explicit)

Do NOT implement in Phase 4H:
- Curve editing
- Timeline authoring
- Export changes
- Interaction triggers
- Physics-based motion
- Audio sync
- Multi-clip blending

These belong to later phases.

## 13) Phase Completion Criteria

Phase 4H is complete when:
- Animations play visually over time
- Playback does not mutate design state
- Undo/redo unaffected
- Replay unaffected
- Export unchanged
- Cancel clears animated store

## 14) Enforcement Rule

Any PR that:
- Dispatches events during playback
- Writes to runtime state
- Writes to persistence
- Touches export logic

Violates Phase 4H and must be reverted.

## 15) Final Statement

Playback is a temporary illusion layered on top of deterministic truth.

If playback ever becomes truth, Dropple OS is broken.
