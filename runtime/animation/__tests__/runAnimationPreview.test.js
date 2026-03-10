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
      document: {
        motion: {
          clips: {
            clip1: {
              id: 'clip1',
              target: 'nodeA',
              property: 'opacity',
              keyframes: [
                { id: 'kf1', t: 0, v: 0, easing: 'linear' },
                { id: 'kf2', t: 300, v: 1, easing: 'linear' },
              ],
            },
          },
        },
      },
      nodes: {
        nodeA: { opacity: 0.2 },
      },
      rootIds: ['nodeA'],
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
