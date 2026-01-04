import { extractComponentIR } from "./extractComponentIR.js";

/**
 * Extracts IR for an entire canvas state.
 * Returns a flat map: id → ComponentIR
 */
export function extractCanvasIR(nodes = {}) {
    const irMap = {};

    Object.values(nodes).forEach((node) => {
        irMap[node.id] = extractComponentIR(node, nodes);
    });

    return irMap;
}
