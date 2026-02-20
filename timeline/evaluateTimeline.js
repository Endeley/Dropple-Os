import { evaluateAnimationProjection } from './evaluateAnimationProjection.js';
import { easingPresets } from './easing/easingPresets.js';

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
    return evaluateRuntimeTimeline({ timeline, time, baseState });
  }

  // Legacy state timeline evaluation (currently unused, kept for compatibility).
  if (state) {
    return evaluateStateTimelineAtTime({ state, time });
  }

  return baseState;
}

function evaluateRuntimeTimeline({ timeline, time, baseState }) {
  if (!timeline || !baseState) return baseState;

  const t = clamp(time, 0, timeline.duration ?? time);
  const nextState = {
    ...baseState,
    nodes: { ...baseState.nodes },
  };

  (timeline.tracks || []).forEach((track) => {
    const { targetId, property, keyframes = [], easing = 'linear' } = track;
    const node = nextState.nodes[targetId];
    if (!node || keyframes.length === 0) return;

    const value = interpolateKeyframes(keyframes, t, easing);
    if (value === undefined) return;

    nextState.nodes[targetId] = {
      ...node,
      [property]: value,
    };
  });

  return nextState;
}

function evaluateStateTimelineAtTime({ state, time }) {
  const timelineState = state?.timeline?.timelines?.default;
  if (!timelineState) return state?.nodes;

  let resultNodes = { ...(state.nodes || {}) };

  timelineState.tracks?.forEach((track) => {
    if (!track || track.muted) return;

    const targetId = track.targetId || track.nodeId;
    if (!targetId) return;

    track.clips?.forEach((clip) => {
      if (time < clip.start || time > clip.end) return;

      clip.keyframes?.forEach((kf) => {
        if (kf.time > time) return;

        const node = resultNodes[targetId];
        if (!node) return;

        resultNodes[targetId] = {
          ...node,
          [kf.property]: kf.value,
        };
      });
    });
  });

  return resultNodes;
}

function interpolateKeyframes(keyframes, time, easingName) {
  const easingFn = easingPresets[easingName] || easingPresets.linear;

  let prev = null;
  let next = null;

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (kf.time <= time) prev = kf;
    if (kf.time > time) {
      next = kf;
      break;
    }
  }

  if (!prev) return keyframes[0]?.value;
  if (!next) return prev.value;

  const localT = (time - prev.time) / (next.time - prev.time);
  const easedT = easingFn(clamp(localT, 0, 1));

  return lerp(prev.value, next.value, easedT);
}

function lerp(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + (b - a) * t;
  }
  return t < 1 ? a : b;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
