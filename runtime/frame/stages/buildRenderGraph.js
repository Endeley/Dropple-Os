import { getNodes } from '@/runtime/document/documentAdapter.js';

export function buildRenderGraph(context) {
    const nodes = getNodes(context.runtimeState);

    // ✅ Engine truth (animation / evaluation)
    const computedTransforms = context.runtimeState?.scene?.computed?.transforms ?? {};

    // 🔑 NEW: interaction layer (drag / resize / rotate preview)
    const interactionTransforms = context.runtimeState?.interaction?.drag?.interactionTransforms ?? null;

    const projectedNodes = Object.values(nodes).map((node) => {
        const animated = computedTransforms[node.id];
        const interaction = interactionTransforms?.[node.id];

        // 🔑 Compose transforms in correct order
        if (!animated && !interaction) return node;

        return {
            ...node,
            transform: {
                ...(node.transform ?? {}),

                // engine layer
                ...(animated ?? {}),

                // interaction layer (always last = override)
                ...(interaction ?? {}),
            },
        };
    });

    return {
        ...context,
        renderGraph: {
            nodes: projectedNodes,
        },
    };
}
