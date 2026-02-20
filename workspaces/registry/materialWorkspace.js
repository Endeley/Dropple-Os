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
    panels: ["NodeHeaderPanel", "LayoutInspector", "ContentPanel"],

    capabilities: {
        canvas: true,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    allowedEventTypes: [],

    export: {
        formats: ["design-tokens", "ui-kit"],
    },
};
