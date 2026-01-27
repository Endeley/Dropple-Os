/**
 * UX Canvas Policy
 * ----------------
 * Declarative rules for how the canvas behaves in UX mode.
 * This file MUST stay side-effect free.
 */
export const uxCanvasPolicy = {
    type: 'ux',

    canvas: {
        infinite: true,
        bounded: false,
        originLocked: false,
    },

    viewport: {
        pan: true,
        zoom: true,
        minZoom: 0.05,
        maxZoom: 8,
        centerOnLoad: true,
    },

    interaction: {
        selectable: false,
        editable: false,
        draggable: false,
        resizable: false,
    },

    intent: {
        readOnly: true,
        allowMutations: false,
    },
};
