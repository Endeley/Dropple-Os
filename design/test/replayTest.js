import { designReducer } from '../reducer/designReducer.js';

const events = [
  {
    type: 'node.create',
    payload: { nodeId: 'a', nodeType: 'frame', parentId: null },
  },
  {
    type: 'node.create',
    payload: { nodeId: 'b', nodeType: 'text', parentId: 'a' },
  },
  {
    type: 'text.content.update',
    payload: { nodeId: 'b', content: 'Hello Dropple' },
  },
];

let state;
for (const e of events) {
  state = designReducer(state, e);
}

console.log(JSON.stringify(state, null, 2));
