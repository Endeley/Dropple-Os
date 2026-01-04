import { DesignIR } from "@/core/ir";

/**
 * Extracts visual & layout intent from a canvas node.
 * READ-ONLY.
 */
export function extractDesignIR(node) {
    if (!node) return null;

    return {
        ...DesignIR,

        id: node.id,
        meta: {
            name: node.name || node.type,
            tags: [],
        },

        layout: {
            display: node.layout?.mode === "auto-y" || node.layout?.mode === "auto-x" ? "flex" : "absolute",
            direction: node.layout?.mode === "auto-y" ? "column" : "row",
            gap: node.layout?.gap ?? 0,
            padding: node.layout?.padding ?? 0,
            align: node.layout?.align ?? "start",
        },

        size: {
            width: node.width ?? null,
            height: node.height ?? null,
            minWidth: null,
            minHeight: null,
        },

        position: {
            x: node.x ?? 0,
            y: node.y ?? 0,
            z: node.z ?? 0,
        },

        style: {
            background: node.background ?? "",
            color: node.color ?? "",
            border: node.border ?? "",
            radius: node.radius ?? 0,
            opacity: node.opacity ?? 1,
        },
    };
}
