import { getNodes } from '@/runtime/document/documentAdapter.js';

export function constraintProjection(runtime) {
    const selectedIds = Array.from(runtime?.selection?.ids ?? []);
    const nodes = {
        ...(runtime?.nodes ?? {}),
        ...getNodes(runtime),
    };

    return Object.freeze(
        selectedIds.map((id) =>
            Object.freeze({
                id,
                constraints: nodes[id]?.constraints ?? nodes[id]?.layout?.constraints ?? null,
            }),
        ),
    );
}
