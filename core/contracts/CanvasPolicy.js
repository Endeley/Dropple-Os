/**
 * CanvasPolicy
 *
 * Declares how the canvas behaves for a workspace.
 * This file is PURE DATA — no logic.
 */
export const DefaultCanvasPolicy = {
    type: 'bounded',
    origin: 'top-left',
    allowPan: false,
    allowZoom: false,
    showPageBounds: true,
    snapToBounds: true,
};
