import { getDesignStateAtCursor } from '../replay/getDesignStateAtCursor.js';
import { createCursor } from '../cursor/createCursor.js';

const events = [
  { id: '1', type: 'node.create', payload: { nodeId: 'a', nodeType: 'frame' } },
  { id: '2', type: 'node.create', payload: { nodeId: 'b', nodeType: 'text', parentId: 'a' } },
  { id: '3', type: 'text.content.update', payload: { nodeId: 'b', content: 'Hello' } },
];

const cursor1 = createCursor({ runId: 'r1', eventId: '2' });
const cursor2 = createCursor({ runId: 'r1', eventId: '2' });

const state1 = getDesignStateAtCursor({ events, cursor: cursor1 });
const state2 = getDesignStateAtCursor({ events, cursor: cursor2 });

console.assert(
  JSON.stringify(state1) === JSON.stringify(state2),
  'Replay must be deterministic'
);

console.log('Cursor replay deterministic');
