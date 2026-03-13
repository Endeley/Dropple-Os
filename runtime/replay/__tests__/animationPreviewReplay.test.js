import test from 'node:test';
import assert from 'node:assert/strict';

import { runAnimationPreview } from '../../animation/runAnimationPreview.js';
import { useAnimatedRuntimeStore } from '../../stores/useAnimatedRuntimeStore.js';
import { createEventDispatcher } from '../../dispatcher/dispatch.js';

test('animation preview during replay does not mutate animated store', () => {
  const dispatcher = createEventDispatcher();

  dispatcher.hydrateRuntimeState(
    {
      nodes: { nodeA: { opacity: 0.5 } },
      rootIds: ['nodeA'],
      __isReplaying: true,
    },
    { animate: false },
  );
  dispatcher.setReplaying(true);

  const before = useAnimatedRuntimeStore.getState();

  runAnimationPreview({
    designState: {
      nodes: { nodeA: { opacity: 0.5 } },
      rootIds: ['nodeA'],
      __isReplaying: true,
    },
    timeMs: 100,
  });

  const animated = useAnimatedRuntimeStore.getState();

  assert.deepEqual(animated.nodes, before.nodes);
  assert.deepEqual(animated.rootIds, before.rootIds);
  assert.equal(animated.cameraTransform, before.cameraTransform);
});
