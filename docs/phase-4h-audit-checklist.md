# Phase 4H — Playback Audit Checklist (Authoritative)

Playback must satisfy all of the following:

- Playback never mutates design state
- Playback never emits events
- Playback never writes to persistence
- Undo / redo are unaffected
- Replay is unaffected (`__isReplaying` blocks playback)
- Only writes to `useAnimatedRuntimeStore`
- Cancel clears animated projection
- Export output is unchanged
- No UI state or DOM reads
- No dispatcher / commit / history writes
