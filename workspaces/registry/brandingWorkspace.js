import { EventTypes } from '@/core/events/eventTypes.js';

export const brandingWorkspace = {
    id: "branding",
    label: "Branding Kits",
    status: "active",

    engines: ["brand", "tokens", "rules", "vector"],

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

    tools: ["edit", "apply", "validate", "path", "shape"],

    panels: [
        "NodeHeaderPanel",
        "LayoutInspector",
        "ContentPanel",
        "SemanticsPanel",
        "ExportPreviewPanel",
    ],

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
        formats: ["brand-kit", "tokens", "pdf"],
    },
};
