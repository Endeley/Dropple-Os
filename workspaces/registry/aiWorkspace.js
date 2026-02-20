export const aiWorkspace = {
    id: "ai",
    label: "AI Suite",
    extends: "education",
    status: "active",

    engines: ["ai", "tutorial", "replay"],

    tools: ["select", "step", "explain"],
    panels: ["NodeHeaderPanel"],

    capabilities: {
        canvas: false,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: true,
    },

    allowedEventTypes: [],
    timeline: null,
};
