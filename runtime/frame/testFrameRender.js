import { runEditorFrame } from './runEditorFrame.js';

const runtimeState = {
  nodes: {
    a: { id: 'a', type: 'frame' },
    b: { id: 'b', type: 'text' },
  },
};

runEditorFrame({
  runtimeState,
  time: 0,
  input: {},
  canvasContext: null,
});

console.log('FRAME PIPELINE  RENDERER BRIDGE OK');
