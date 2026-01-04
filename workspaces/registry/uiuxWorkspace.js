export const uiuxWorkspace = {
    id: "uiux",
    label: "UI / UX Design",
    extends: "graphic",
    status: "active",

    engines: ["nodeTree", "layout", "constraints", "autoLayout"],

    ir: {
        design: true,
        layout: true,
        interaction: true,
        state: true,
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

    nodes: ["frame", "group", "text", "image", "component"],

    tools: ["select", "move", "resize", "text", "component"],
    panels: ["layers", "properties", "tokens"],

    export: {
        formats: ["react", "html", "css"],
    },
};
