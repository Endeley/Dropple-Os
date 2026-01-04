export const conversionWorkspace = {
    id: "conversion",
    label: "Design to Code",
    status: "active",

    engines: ["parser", "ast", "codegen"],

    ir: {
        design: true,
        layout: true,
        interaction: false,
        state: false,
        motion: false,
        audio: false,
        video: false,
        semantic: true,
        code: true,
    },

    timeline: {
        enabled: false,
        primary: false,
        tracks: [],
    },

    nodes: [],

    tools: ["inspect", "map", "convert"],

    panels: ["source", "mapping", "output"],

    export: {
        formats: ["react", "vue", "html", "css"],
    },
};
