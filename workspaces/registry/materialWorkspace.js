import { EventTypes } from '@/core/events/eventTypes.js';

export const materialWorkspace = {
    id: "material",
    label: "Material UI System",
    status: "active",

    engines: ["nodeTree", "layout", "tokens", "vector"],

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

    nodes: ["component", "variant", "vector"],

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

    allowedEventTypes: [
        EventTypes.VECTOR_CREATE,
        EventTypes.VECTOR_UPDATE,
        EventTypes.VECTOR_DELETE,
        EventTypes.TOKEN_CREATE,
        EventTypes.TOKEN_SET,
        EventTypes.TOKEN_DELETE,
        EventTypes.TOKEN_ALIAS_SET,
        EventTypes.THEME_CREATE,
        EventTypes.THEME_SWITCH,
        EventTypes.TOKEN_VERSION_TAG,
        EventTypes.TOKEN_VERSION_FORK,
        EventTypes.TOKEN_VERSION_MERGE,
        EventTypes.TOKEN_VERSION_ROLLBACK,
        EventTypes.TOKEN_REVIEW_SUBMIT,
        EventTypes.TOKEN_REVIEW_APPROVE,
        EventTypes.TOKEN_REVIEW_REJECT,
        EventTypes.TOKEN_REVIEW_REQUEST_CHANGES,
    ],

    export: {
        formats: ["design-tokens", "ui-kit"],
    },
};
