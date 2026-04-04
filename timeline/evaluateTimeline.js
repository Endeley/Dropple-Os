import { evaluateAnimationProjection } from './evaluateAnimationProjection.js';
import { evaluateTimelineFrame } from './evaluateTimelineFrame.js';

/**
 * Canonical timeline evaluation interface.
 *
 * All timeline evaluation must import from `@/timeline/evaluateTimeline`.
 * This keeps the evaluator sovereign and makes call sites explicit.
 */
export function evaluateTimeline({
  animations,
  timeMs,
  baseState,
  clipId,
  timeline,
  time,
  state,
}) {
  // Animation V1 path (animations + timeMs).
  if (animations || timeMs !== undefined) {
    const animationSource = animations?.animations || animations;
    const projection = evaluateAnimationProjection({
      animations: animationSource,
      timeMs,
      clipId,
    });

    if (!baseState) return projection;

    return {
      ...baseState,
      nodes: {
        ...(baseState.nodes || {}),
        ...(projection.nodes || {}),
      },
    };
  }

  // Runtime timeline preview path.
  if (timeline) {
    return evaluateTimelineFrame({
      timeline,
      time,
      baseState,
    });
  }

  // Legacy state timeline evaluation delegates to the same frame sampler.
  if (state) {
    return evaluateTimelineFrame({
      timeline: state?.timeline?.timelines?.default ?? null,
      time,
      baseState: state,
    });
  }

  return baseState;
}
