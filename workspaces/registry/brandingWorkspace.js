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

    panels: [
        "NodeHeaderPanel",
        "LayoutInspector",
        "ContentPanel",
        "SemanticsPanel",
        "ExportPreviewPanel",
    ],

    capabilities: {
        canvas: false,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    allowedEventTypes: [],

    export: {
        formats: ["brand-kit", "tokens", "pdf"],
    },
};
