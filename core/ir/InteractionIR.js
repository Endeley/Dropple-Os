import { BaseIR } from "./BaseIR";

/**
 * Interaction intent.
 * NOT framework-specific.
 */
export const InteractionIR = {
    ...BaseIR,

    kind: "interaction",

    events: {
        click: null,
        hover: null,
        focus: null,
        blur: null,
        drag: null,
    },

    gestures: {
        pointerDown: null,
        pointerMove: null,
        pointerUp: null,
    },
};
