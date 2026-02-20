// NOTE: Tests defined but not executed yet.
// Runner setup is deferred intentionally.
import { exportAnimation } from '../exportAnimation.js';

describe('exportAnimation (Phase 4D)', () => {
  it('produces deterministic normalized output', () => {
    const state = {
      timeline: {
        animations: {
          clips: {
            c1: {
              id: 'c1',
              durationMs: 100,
              trackIds: ['t1'],
            },
          },
          tracks: {
            t1: {
              id: 't1',
              clipId: 'c1',
              nodeId: 'nodeA',
              property: 'opacity',
              keyframeIds: ['k1', 'k2'],
            },
          },
          keyframes: {
            k1: {
              id: 'k1',
              trackId: 't1',
              timeMs: 0,
              value: 0,
              easing: 'linear',
            },
            k2: {
              id: 'k2',
              trackId: 't1',
              timeMs: 100,
              value: 1,
              easing: 'linear',
            },
          },
        },
      },
    };

    const a = exportAnimation({ state, format: 'css' });
    const b = exportAnimation({ state, format: 'css' });

    expect(a.normalized).toBe(b.normalized);
  });
});
