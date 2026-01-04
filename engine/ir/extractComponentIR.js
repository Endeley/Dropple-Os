import { ComponentIR } from "@/core/ir";
import { extractDesignIR } from "./extractDesignIR.js";
import { extractInteractionIR } from "./extractInteractionIR.js";
import { extractStateIR } from "./extractStateIR.js";
import { extractMotionIR } from "./extractMotionIR.js";
import { extractSemanticIR } from "./extractSemanticIR.js";

/**
 * Extracts full IR representation of a canvas node.
 * READ-ONLY.
 */
export function extractComponentIR(node, allNodes = {}) {
    if (!node) return null;

    return {
        ...ComponentIR,

        id: node.id,

        meta: {
            name: node.name || node.type,
            tags: [],
        },

        children: node.children ?? [],

        design: extractDesignIR(node),
        interaction: extractInteractionIR(node),
        state: extractStateIR(node),
        motion: extractMotionIR(node),
        semantic: extractSemanticIR(node),
    };
}
