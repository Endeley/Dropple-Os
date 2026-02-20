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
    panels: ["NodeHeaderPanel"],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
        education: true,
        editing: false,
    },

    allowedEventTypes: [],

    export: {
        formats: [],
    },
};
