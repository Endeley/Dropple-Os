import { InteractionIR } from "@/core/ir";

/**
 * Extracts interaction intent.
 * Canvas does not store handlers, only intent placeholders.
 */
export function extractInteractionIR(node) {
    if (!node) return null;

    return {
        ...InteractionIR,

        id: node.id,

        events: {
            click: node.interactive ? "click" : null,
            hover: null,
            focus: null,
            blur: null,
            drag: node.draggable ? "drag" : null,
        },

        gestures: {
            pointerDown: null,
            pointerMove: null,
            pointerUp: null,
        },
    };
}
