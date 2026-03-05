import { createInteractionSession } from '../interactionSession.js';
import { createToolController } from '../toolController.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const runtimeState = {
  nodes: {
    a: { id: 'a', type: 'frame', x: 0, y: 0, width: 100, height: 100 },
  },
};

const events = [];
const dispatch = (evt) => events.push(evt);
const getRuntimeState = () => runtimeState;

const controller = createToolController({ getRuntimeState, dispatch });
const session = createInteractionSession();

controller.onPointerDown(session, { x: 10, y: 10 }, 1, 'move');
assert(events.length === 1, 'selection should dispatch on pointer down');
assert(events[0].type === 'selection/set', 'selection event type mismatch');
assert(events[0].payload.ids[0] === 'a', 'selection should pick node a');

controller.onPointerMove(session, { x: 20, y: 25 });
assert(session.previewDelta.dx === 10, 'preview dx mismatch');
assert(session.previewDelta.dy === 15, 'preview dy mismatch');

controller.onPointerUp(session);
assert(events.length === 2, 'move should dispatch on pointer up');
assert(events[1].type === 'node/move', 'move event type mismatch');
assert(events[1].payload.id === 'a', 'move payload id mismatch');
assert(events[1].payload.dx === 10, 'move dx mismatch');
assert(events[1].payload.dy === 15, 'move dy mismatch');

console.log('toolController deterministic: OK');
