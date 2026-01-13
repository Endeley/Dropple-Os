// NOTE: Tests defined but not executed yet.
// Runner setup is deferred intentionally.
import { runAnimationPreview } from '../../animation/runAnimationPreview.js';
import { useAnimatedRuntimeStore } from '../../stores/useAnimatedRuntimeStore.js';
import { setRuntimeState } from '../../state/runtimeState.js';

describe('animation preview during replay', () => {
  it('does not run during replay', () => {
    setRuntimeState({
      nodes: { nodeA: { opacity: 0.5 } },
      rootIds: ['nodeA'],
      __isReplaying: true,
    });

    runAnimationPreview({
      designState: {
        nodes: { nodeA: { opacity: 0.5 } },
        rootIds: ['nodeA'],
        __isReplaying: true,
      },
      timeMs: 100,
    });

    const animated = useAnimatedRuntimeStore.getState();
    expect(animated.nodes).toEqual({});
  });
});
