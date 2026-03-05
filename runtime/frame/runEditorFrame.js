import { renderFrame } from './renderFrame.js';

export function runEditorFrame({
  runtimeState,
  time,
  input,
  canvasContext,
}) {
  return renderFrame({
    runtimeState,
    time,
    input,
    canvasContext,
  });
}
