/**
 * Framework-agnostic animation intent.
 * Deterministic, serializable, exportable.
 */
export function createAnimationIR({ target, property, keyframes }) {
    return {
        target, // nodeId
        property, // 'x', 'y', 'opacity', 'scale', etc.
        keyframes: (keyframes || [])
            .slice()
            .sort((a, b) => a.time - b.time)
            .map((k) => ({
                time: k.time,
                value: k.value,
                easing: k.easing || 'linear',
            })),
    };
}
