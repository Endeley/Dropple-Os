export const educationWorkspace = {
    id: "education",
    label: "Education",
    status: "active",

    engines: ["ai", "tutorial", "replay"],

    ir: {
        design: false,
        layout: false,
        interaction: false,
        state: false,
        motion: false,
        audio: false,
        video: false,
        semantic: true,
        code: false,
    },

    timeline: {
        enabled: true,
        primary: true,
        tracks: ["logical"],
    },

    nodes: [],

    tools: ["select", "step", "explain"],
    panels: ["lessons", "steps", "explanations"],

    export: {
        formats: [],
    },
};
