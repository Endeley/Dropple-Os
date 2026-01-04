import { BaseIR } from "./BaseIR";

/**
 * Visual & layout intent.
 * Used by UI, Graphic, Document, Video overlays.
 */
export const DesignIR = {
    ...BaseIR,

    kind: "design",

    layout: {
        display: "", // block | flex | grid | absolute
        direction: "", // row | column
        gap: 0,
        padding: 0,
        align: "", // start | center | end | stretch
    },

    size: {
        width: null,
        height: null,
        minWidth: null,
        minHeight: null,
    },

    position: {
        x: 0,
        y: 0,
        z: 0,
    },

    style: {
        background: "",
        color: "",
        border: "",
        radius: 0,
        opacity: 1,
    },
};
