import { createTimelineCapability } from "./timelineCapability.js";

export const uiuxWorkspace = {
    id: "uiux",
    label: "UI / UX Design",
    extends: "graphic",
    status: "active",

    engines: ["nodeTree", "layout", "constraints", "autoLayout"],
    tools: ["select", "move", "resize", "text", "shape", "image"],
    panels: ["layers", "properties", "tokens"],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    timeline: createTimelineCapability({
        readOnly: true,
        allowedProperties: ["x", "y", "opacity"],
    }),

    export: {
        formats: ["react", "html", "css"],
    },
};
