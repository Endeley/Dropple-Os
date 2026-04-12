import { ResizeSession } from '@/runtime/interactions/input/sessions/ResizeSession.js';
import { createSessionCommitActions } from '@/runtime/input/sessionCommitRuntimeBridge.js';
import { EventTypes } from '@/core/events/eventTypes.js';

const nodesById = {
  a: { id: 'a', x: 0, y: 0, width: 100, height: 50 },
};

const session = new ResizeSession({
  nodeIds: ['a'],
  nodes: [nodesById.a],
  startPointer: { x: 0, y: 0 },
  handle: 'se',
});

session.onPointerMove({ x: 10, y: 5 });
const payload = session.commit();

const actions = createSessionCommitActions({
  event: { sessionType: 'resize', payload },
  context: {
    nodesById,
    runtime: {
      scene: {
        computed: {
          transforms: {
            a: { x: 25, y: 10 },
          },
        },
      },
    },
    selectedIds: ['a'],
    frameTime: 0,
    autoKeyframeEnabled: false,
    canAuthorAnimationKeyframes: false,
    isAutoLayoutChild: () => false,
  },
});

const dispatchEvents = actions?.dispatchEvents || [];

if (dispatchEvents.length !== 1) {
  console.error('Expected single dispatch event');
  process.exit(1);
}

if (dispatchEvents[0].type !== EventTypes.NODE_UPDATE) {
  console.error('Unexpected dispatch event type');
  process.exit(1);
}

if (dispatchEvents[0].payload.patch.x !== 27.5 || dispatchEvents[0].payload.patch.y !== 11) {
  console.error('Expected transform-aware resize math to scale from computed position');
  process.exit(1);
}

console.log('RESIZE SESSION COMMIT BRIDGE: true');
