export function createInteractionSession() {
  return {
    active: false,
    toolId: 'select',
    pointerId: null,

    startWorld: null,
    lastWorld: null,

    hitNodeId: null,

    previewDelta: { dx: 0, dy: 0 },
    selectionBox: null,
  };
}
