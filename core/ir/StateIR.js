import { BaseIR } from "./BaseIR";

/**
 * State & data flow intent.
 * Maps to React state, Vue refs, Flutter state, etc.
 */
export const StateIR = {
    ...BaseIR,

    kind: "state",

    props: {}, // external inputs
    state: {}, // internal state
    derived: {}, // computed values

    bindings: {
        text: null,
        value: null,
        visible: null,
        enabled: null,
    },
};
