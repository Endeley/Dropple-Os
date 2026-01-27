export const iconWorkspace = {
    id: "icons",
    label: "Icon Design",
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

    nodes: ["vector", "shape"],

    tools: ["select", "path", "stroke"],
    panels: ["layers", "properties"],

    export: {
        formats: ["svg", "icon-font"],
    },
};
