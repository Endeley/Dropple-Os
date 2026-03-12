export function createPreviewState() {
  const transform = new Map();

  return {
    transform,
    // Backward-compatible alias for older preview consumers.
    transforms: transform,
    viewport: null,
    marquee: null,
    guides: [],
    snapping: [],
    constraints: [],
  };
}

export function clearPreviewState(state) {
  if (!state) return state;

  state.transform?.clear?.();
  if (state.transforms && state.transforms !== state.transform) {
    state.transforms.clear?.();
  }

  state.viewport = null;
  state.marquee = null;
  state.guides = [];
  state.snapping = [];
  state.constraints = [];

  return state;
}
