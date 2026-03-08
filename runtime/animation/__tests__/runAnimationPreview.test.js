// NOTE: Tests defined but not executed yet.
// Runner setup is deferred intentionally.
import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAnimationPreview } from '../runAnimationPreview.js';
import { useAnimatedRuntimeStore } from '../../stores/useAnimatedRuntimeStore.js';
import { getRuntimeState } from '../../state/runtimeState.js';
import { createEventDispatcher } from '../../dispatcher/dispatch.js';

const dispatcher = createEventDispatcher();

describe('runAnimationPreview (illusion only)', () => {
  beforeEach(() => {
    dispatcher.hydrateRuntimeState({
      nodes: {
        nodeA: { opacity: 0.2 },
      },
      rootIds: ['nodeA'],
      timeline: {
        animations: {
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
        },
      },
    }, { animate: false });

    useAnimatedRuntimeStore.setState({ nodes: {}, rootIds: [] }, false);
  });

  it('writes only to animated store', () => {
    const before = getRuntimeState();

    runAnimationPreview({
      designState: getRuntimeState(),
      timeMs: 150,
    });

    const after = getRuntimeState();
    const animated = useAnimatedRuntimeStore.getState();

    assert.deepEqual(after, before);
    assert.notEqual(animated.nodes.nodeA.opacity, undefined);
  });

  it('cancel clears preview state', () => {
    const preview = runAnimationPreview({
      designState: getRuntimeState(),
      timeMs: 150,
    });

    preview.cancel();

    const animated = useAnimatedRuntimeStore.getState();
    assert.deepEqual(animated.nodes, {});
  });

  it('does not alter runtime nodes after cancel', () => {
    const preview = runAnimationPreview({
      designState: getRuntimeState(),
      timeMs: 150,
    });

    preview.cancel();

    const runtime = getRuntimeState();
    assert.equal(runtime.nodes.nodeA.opacity, 0.2);
  });
});
