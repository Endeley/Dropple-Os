import { computeConstraints } from './computeConstraints.js';

export function applyConstraints(nodes, parentBounds, delta) {
    return (nodes || []).map((node) => ({
        id: node?.id ?? null,
        delta: computeConstraints(node, parentBounds, delta),
    }));
}
