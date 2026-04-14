import { getNodes } from '@/runtime/document/documentAdapter.js';

export function buildRenderGraph(context) {
    const runtimeState = context.runtimeState;
    const nodes = getNodes(runtimeState);

    const scene = runtimeState?.scene ?? {};
    const drag = runtimeState?.interaction?.drag ?? null;

    // ✅ Engine truth (animation / evaluation)
    const computedTransforms = scene?.computed?.transforms ?? {};

    // ✅ Interaction layer (drag / resize / rotate preview)
    const interactionTransforms =
        drag && drag.active && drag.interactionTransforms
            ? drag.interactionTransforms
            : null;

    const projectedNodes = Object.values(nodes).map((node) => {
        const animated = computedTransforms[node.id];
        const interaction = interactionTransforms?.[node.id];

        // Nothing to project → return original node (no mutation)
        if (!animated && !interaction) return node;

        return {
            ...node,
            transform: {
                ...(node.transform ?? {}),

                // 🔹 Engine layer (animation / layout / constraints)
                ...(animated ?? {}),

                // 🔹 Interaction layer (ALWAYS LAST → overrides)
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