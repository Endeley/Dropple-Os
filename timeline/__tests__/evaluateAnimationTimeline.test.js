// NOTE: Tests defined but not executed yet.
// Runner setup is deferred intentionally.
import { evaluateAnimationTimeline } from '../evaluateAnimationTimeline.js';

describe('evaluateAnimationTimeline (pure)', () => {
  const animations = {
    clips: {
      clip1: {
        id: 'clip1',
        durationMs: 300,
        trackIds: ['track1'],
      },
    },
    tracks: {
      track1: {
        id: 'track1',
        clipId: 'clip1',
        nodeId: 'nodeA',
        property: 'opacity',
        keyframeIds: ['kf1', 'kf2'],
      },
    },
    keyframes: {
      kf1: {
        id: 'kf1',
        trackId: 'track1',
        timeMs: 0,
        value: 0,
        easing: 'linear',
      },
      kf2: {
        id: 'kf2',
        trackId: 'track1',
        timeMs: 300,
        value: 1,
        easing: 'linear',
      },
    },
  };

  it('returns deterministic output', () => {
    const r1 = evaluateAnimationTimeline({
      animations,
      timeMs: 150,
    });

    const r2 = evaluateAnimationTimeline({
      animations,
      timeMs: 150,
    });

    expect(r1).toEqual(r2);
  });

  it('does not mutate animation input', () => {
    const snapshot = JSON.stringify(animations);

    evaluateAnimationTimeline({
      animations,
      timeMs: 100,
    });

    expect(JSON.stringify(animations)).toBe(snapshot);
  });

  it('returns empty nodes when animations missing', () => {
    const result = evaluateAnimationTimeline({
      animations: null,
      timeMs: 100,
    });

    expect(result).toEqual({ nodes: {} });
  });
});
