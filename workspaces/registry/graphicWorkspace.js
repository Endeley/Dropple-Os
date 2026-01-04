export const graphicWorkspace = {
    id: "graphic",
    label: "Graphic Design",
    status: "active",

    engines: ["nodeTree", "layout"],
    tools: ["select", "move", "resize", "text", "shape", "image"],
    panels: ["layers", "properties"],

    capabilities: {
        canvas: true,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    timeline: null,

    export: {
        formats: ["png", "jpg", "svg", "pdf"],
    },
};
