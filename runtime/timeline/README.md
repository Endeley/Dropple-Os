# Timeline (Runtime)

Pure data model and evaluation helpers for time-based preview.

- No UI
- No reducers
- No runtime state mutation

Files:
- `timelineSchema.js` — constructors for timeline/track/keyframe (ms-based)
- `evaluateTimeline.js` — pure evaluation at time t
- `easingPresets.js` — deterministic easing helpers
- `scrubTimeline.js` — read-only preview controller
- `clearTimelinePreview.js` — clears preview store

Preview priority is handled via `useRenderState` in UI: preview first, runtime state second.
