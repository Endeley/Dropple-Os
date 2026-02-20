export const documentWorkspace = {
    id: "document",
    label: "Documents & Print",
    status: "active",

    engines: ["layout", "textFlow", "pagination"],

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

    tools: ["text", "section", "page"],

    panels: ["NodeHeaderPanel"],

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
        formats: ["pdf", "docx", "ppt"],
    },
};
