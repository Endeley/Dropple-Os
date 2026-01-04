import { BaseIR } from "./BaseIR";

/**
 * Time-based intent.
 * Used by animation, video, podcast, transitions.
 */
export const MotionIR = {
    ...BaseIR,

    kind: "motion",

    timeline: {
        start: 0,
        end: 0,
        duration: 0,
    },

    keyframes: [], // [{ time, values }]
    easing: "linear",

    autoplay: false,
    loop: false,
};
