import { replayEvents } from '../dispatcher/replayEvents.js';
import { EventTypes } from '../../core/events/eventTypes.js';
import { hashRuntimeState } from '../utils/hashRuntimeState.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const events = [
  {
    type: EventTypes.NODE_CREATE,
    payload: { node: { id: 'a', type: 'frame' } },
  },
  {
    type: EventTypes.NODE_CREATE,
    payload: { node: { id: 'b', type: 'text' } },
  },
  {
    type: EventTypes.NODE_ATTACH,
    payload: { parentId: 'a', childId: 'b' },
  },
  {
    type: 'text.content.update',
    payload: { nodeId: 'b', content: 'Hello Dropple' },
  },
];

const stateA = replayEvents({ events });
const stateB = replayEvents({ events });

assert(stateA, 'replayEvents returned empty state (A)');
assert(stateB, 'replayEvents returned empty state (B)');

const hashA = hashRuntimeState(stateA);
const hashB = hashRuntimeState(stateB);

console.log('RUNTIME HASH A:', hashA);
console.log('RUNTIME HASH B:', hashB);

if (hashA !== hashB) {
  console.error('Runtime replay produced non-deterministic state');
  process.exit(1);
}

console.log('RUNTIME REPLAY DETERMINISTIC: true');
