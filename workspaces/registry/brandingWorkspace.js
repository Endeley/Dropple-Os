export const brandingWorkspace = {
    id: "branding",
    label: "Branding Kits",
    status: "active",

    engines: ["brand", "tokens", "rules"],

    ir: {
        design: true,
        layout: true,
        interaction: false,
        state: false,
        motion: false,
        audio: false,
        video: false,
        semantic: true,
        code: false,
    },

    timeline: {
        enabled: false,
        primary: false,
        tracks: [],
    },

    nodes: [],

    tools: ["edit", "apply", "validate"],

    panels: ["brand", "colors", "typography", "rules"],

    export: {
        formats: ["brand-kit", "tokens", "pdf"],
    },
};
