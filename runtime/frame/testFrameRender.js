import test from 'node:test';
import assert from 'node:assert/strict';

import { runEditorFrame } from './runEditorFrame.js';

test('frame pipeline renderer bridge tolerates headless execution', () => {
  const runtimeState = {
    nodes: {
      a: { id: 'a', type: 'frame' },
      b: { id: 'b', type: 'text' },
    },
  };

  assert.doesNotThrow(() => {
    runEditorFrame({
      runtimeState,
      time: 0,
      input: {},
      canvasContext: null,
    });
  });
});
