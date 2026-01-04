export const conversionWorkspace = {
    id: "conversion",
    label: "Design → Code",
    status: "active",

    engines: ["nodeTree", "layout", "timeline"],

    tools: [],
    panels: ["export"],

    capabilities: {
        canvas: true,
        timeline: true, // read-only: for exporting motion
        animation: false,
        audio: false,
        video: false,
        codegen: true,
    },

    timeline: null,

    export: {
        formats: ["css", "lottie", "react"],
    },
};
