import { runEditorFrame } from '@/ui/bridges/canvasRuntimeFacade.js';

export function runCanvasLoop({
  getRuntimeState,
  canvasContext,
  previewSessionRef,
}) {
  let running = true;
  let time = 0;

  function frame() {
    if (!running) return;

    const runtimeState = getRuntimeState();

    runEditorFrame({
      runtimeState,
      time,
      input: {
        previewSession: previewSessionRef?.current || null,
      },
      canvasContext,
    });

    time += 16;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return () => {
    running = false;
  };
}
