import test from 'node:test';
import assert from 'node:assert/strict';

import { runAnimationPreview } from '../../animation/runAnimationPreview.js';
import { useAnimatedRuntimeStore } from '../../stores/useAnimatedRuntimeStore.js';
import { createEventDispatcher } from '../../dispatcher/dispatch.js';

test('animation preview during replay does not mutate animated store', () => {
  const dispatcher = createEventDispatcher();

  dispatcher.hydrateRuntimeState(
    {
      document: {
        sceneGraph: {
          rootIds: ['nodeA'],
          nodes: {
            nodeA: { id: 'nodeA', type: 'frame', children: [], opacity: 0.5 },
          },
        },
      },
      __isReplaying: true,
    },
    { animate: false },
  );
  dispatcher.setReplaying(true);

  const before = useAnimatedRuntimeStore.getState();

  runAnimationPreview({
    designState: {
      document: {
        sceneGraph: {
          rootIds: ['nodeA'],
          nodes: {
            nodeA: { id: 'nodeA', type: 'frame', children: [], opacity: 0.5 },
          },
        },
      },
      __isReplaying: true,
    },
    timeMs: 100,
  });

  const animated = useAnimatedRuntimeStore.getState();

  assert.deepEqual(animated.previewNodes, before.previewNodes);
  assert.equal(animated.cameraTransform, before.cameraTransform);
});
