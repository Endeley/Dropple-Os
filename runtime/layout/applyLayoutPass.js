import { computeAutoLayout } from '@/layout/autoLayoutEngine';

/**
 * Applies auto-layout to all containers that declare layout rules.
 * Runs AFTER reducers, BEFORE state is finalized.
 */
export function applyLayoutPass(state) {
    if (!state?.nodes) return state;

    let nextState = state;

    Object.values(state.nodes).forEach((node) => {
        const layout = node.layout;
        if (!layout || layout.mode === 'none') return;

        const childrenIds = node.children || [];
        if (!childrenIds.length) return;

        const children = childrenIds.map((id) => state.nodes[id]).filter(Boolean);

        const positions = computeAutoLayout(node, children, state.nodes);
        if (!positions) return;

        // Apply derived positions
        const updatedNodes = { ...nextState.nodes };

        Object.entries(positions).forEach(([id, pos]) => {
            const child = updatedNodes[id];
            if (!child) return;

            updatedNodes[id] = {
                ...child,
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: pos.height,
            };
        });

        nextState = {
            ...nextState,
            nodes: updatedNodes,
        };
    });

    return nextState;
}
