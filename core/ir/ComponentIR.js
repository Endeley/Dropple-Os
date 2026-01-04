import { BaseIR } from "./BaseIR";

/**
 * High-level component intent.
 * Aggregates all other IR layers.
 */
export const ComponentIR = {
    ...BaseIR,

    kind: "component",

    children: [], // array of ComponentIR ids

    design: null, // DesignIR
    interaction: null, // InteractionIR
    state: null, // StateIR
    motion: null, // MotionIR
    semantic: null, // SemanticIR
};
