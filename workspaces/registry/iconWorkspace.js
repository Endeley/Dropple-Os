import { EventTypes } from '@/core/events/eventTypes.js';

export const iconWorkspace = {
    id: "icons",
    label: "Icon Design",
    status: "active",

    engines: ["nodeTree", "layout", "vector"],

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
    panels: ["NodeHeaderPanel", "LayoutInspector", "ContentPanel"],

    capabilities: {
        canvas: true,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    allowedEventTypes: [
        EventTypes.VECTOR_CREATE,
        EventTypes.VECTOR_UPDATE,
        EventTypes.VECTOR_DELETE,
    ],

    export: {
        formats: ["svg", "icon-font"],
    },
};
