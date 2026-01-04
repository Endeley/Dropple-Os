import { StateIR } from "@/core/ir";

/**
 * Extracts state & binding intent.
 * No runtime logic included.
 */
export function extractStateIR(node) {
    if (!node) return null;

    return {
        ...StateIR,

        id: node.id,

        props: node.props ?? {},

        state: {}, // canvas nodes are mostly stateless
        derived: {},

        bindings: {
            text: node.type === "text" ? "text" : null,
            value: null,
            visible: null,
            enabled: null,
        },
    };
}
