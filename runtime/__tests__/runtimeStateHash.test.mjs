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
];

const state = replayEvents({ events });
assert(state, 'replayEvents returned empty state');

const hashA = hashRuntimeState(state);
const hashB = hashRuntimeState(structuredClone(state));

console.log('STATE HASH A:', hashA);
console.log('STATE HASH B:', hashB);

if (hashA !== hashB) {
  console.error('Runtime state hash instability detected');
  process.exit(1);
}

console.log('RUNTIME STATE HASH STABLE: true');
