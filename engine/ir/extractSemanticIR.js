import { SemanticIR } from "@/core/ir";

/**
 * Extracts semantic meaning & accessibility intent.
 */
export function extractSemanticIR(node) {
    if (!node) return null;

    return {
        ...SemanticIR,

        id: node.id,

        role: node.role ?? inferRole(node.type),
        label: node.label ?? "",
        description: "",

        accessibility: {
            ariaLabel: node.ariaLabel ?? "",
            ariaRole: node.role ?? "",
            tabIndex: node.tabIndex ?? 0,
        },
    };
}

function inferRole(type) {
    switch (type) {
        case "text":
            return "text";
        case "image":
            return "img";
        case "frame":
            return "group";
        default:
            return "generic";
    }
}
