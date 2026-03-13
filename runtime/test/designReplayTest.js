import { replayEvents } from '@/core/persistence/replayEngine.js';
import { EventTypes } from '@/core/events/eventTypes.js';

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

const state = replayEvents({ events });

console.log(JSON.stringify(state, null, 2));
