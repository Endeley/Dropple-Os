import { createTimelineCapability } from "./timelineCapability.js";

export const videoWorkspace = {
    id: "video",
    label: "Video Editor",
    status: "active",

    engines: ["timeline", "media"],
    tools: ["cut", "trim", "overlay", "text"],
    panels: ["timeline", "layers", "export"],

    capabilities: {
        canvas: false,
        timeline: true,
        animation: false,
        audio: true,
        video: true,
        codegen: false,
    },

    timeline: createTimelineCapability({
        readOnly: false,
        allowedProperties: ["x", "y", "opacity", "volume"],
    }),

    export: {
        formats: ["mp4"],
    },
};
