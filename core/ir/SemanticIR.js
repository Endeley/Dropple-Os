import { BaseIR } from "./BaseIR";

/**
 * Semantic meaning & accessibility intent.
 * Crucial for real code translation.
 */
export const SemanticIR = {
    ...BaseIR,

    kind: "semantic",

    role: "", // button, heading, image, input
    label: "",
    description: "",

    accessibility: {
        ariaLabel: "",
        ariaRole: "",
        tabIndex: 0,
    },
};
