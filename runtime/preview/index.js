import { clearPreviewState, createPreviewState } from '../state/previewState.js';

export function applyPreviewPatch(runtime, patch = {}) {
  if (!runtime.preview) {
    runtime.preview = createPreviewState();
  }

  const preview = runtime.preview;

  if (patch.transform || patch.transforms) {
    const source = patch.transform ?? patch.transforms;
    for (const [id, delta] of source) {
      preview.transform.set(id, delta);
    }
  }

  if (patch.viewport !== undefined) {
    preview.viewport = patch.viewport;
  }

  if (patch.marquee !== undefined) {
    preview.marquee = patch.marquee;
  }

  if (patch.guides) {
    preview.guides = patch.guides;
  }

  if (patch.snapping) {
    preview.snapping = patch.snapping;
  }

  if (patch.constraints) {
    preview.constraints = patch.constraints;
  }

  return preview;
}

export function clearPreviewPatch(runtime) {
  if (!runtime.preview) {
    runtime.preview = createPreviewState();
    return runtime.preview;
  }

  clearPreviewState(runtime.preview);
  return runtime.preview;
}
