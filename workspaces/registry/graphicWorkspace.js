export const graphicWorkspace = {
    id: "graphic",
    label: "Graphic Design",
    status: "active",

    engines: ["nodeTree", "layout"],

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

    nodes: ["frame", "group", "shape", "text", "image", "vector"],

    tools: ["select", "move", "resize", "text", "shape", "image"],
    panels: ["layers", "properties"],

    export: {
        formats: ["png", "jpg", "svg", "pdf"],
    },
};
