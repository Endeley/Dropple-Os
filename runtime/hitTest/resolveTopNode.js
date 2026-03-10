export function resolveTopNode(runtime, nodeIds) {
    if (!nodeIds || nodeIds.length === 0) return null;

    const computed = runtime?.scene?.computed || {};
    const ordered = [...nodeIds].sort((a, b) => {
        const za = computed[a]?.zIndex ?? 0;
        const zb = computed[b]?.zIndex ?? 0;
        return za - zb;
    });

    return ordered[ordered.length - 1];
}
