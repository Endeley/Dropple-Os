export const materialWorkspace = {
    id: "material",
    label: "Material UI System",
    status: "active",

    engines: ["nodeTree", "layout", "tokens"],

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

    nodes: ["component", "variant"],

    tools: ["component", "variant", "token"],
    panels: ["tokens", "components", "properties"],

    export: {
        formats: ["design-tokens", "ui-kit"],
    },
};
