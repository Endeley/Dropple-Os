import { canProjectToCanonicalNode } from '@/validation/canProjectToCanonicalNode';

/**
 * Dev-only validator for DroppleSpec.
 * No runtime mutation. No persistence changes.
 */
export function validateDroppleSpec(spec) {
    if (process.env.NODE_ENV !== 'development') return;

    assertRequired(spec, ['version', 'world', 'nodes', 'edges', 'modes', 'metadata']);
    assertNoForbiddenFields(spec);
    assertNodesProjectable(spec.nodes);
}

function assertRequired(obj, keys) {
    for (const k of keys) {
        if (!(k in obj)) {
            throw new Error(`[DroppleSpec] Missing required field: ${k}`);
        }
    }
}

function assertNoForbiddenFields(spec) {
    const forbidden = [
        'viewport',
        'camera',
        'selection',
        'history',
        'events',
        'cursor',
        'timelines',
        'markers',
    ];
    for (const k of forbidden) {
        if (k in spec) {
            throw new Error(`[DroppleSpec] Forbidden runtime field leaked into export: ${k}`);
        }
    }
}

function assertNodesProjectable(nodes) {
    for (const n of nodes || []) {
        if (!canProjectToCanonicalNode(n)) {
            console.warn('[DroppleSpec] Node cannot project to canonical contract', n);
        }
    }
}
