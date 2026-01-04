import { MotionIR } from "@/core/ir";

/**
 * Extracts timeline / animation intent.
 * If no animation exists, returns null.
 */
export function extractMotionIR(node) {
    if (!node?.motion) return null;

    return {
        ...MotionIR,

        id: node.id,

        timeline: {
            start: node.motion.start ?? 0,
            end: node.motion.end ?? 0,
            duration: node.motion.duration ?? 0,
        },

        keyframes: node.motion.keyframes ?? [],
        easing: node.motion.easing ?? "linear",

        autoplay: node.motion.autoplay ?? false,
        loop: node.motion.loop ?? false,
    };
}
