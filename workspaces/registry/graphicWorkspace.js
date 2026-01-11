// workspaces/registry/graphicWorkspace.js
import { EventTypes } from '@/core/events/eventTypes.js';

export const graphicWorkspace = {
    id: 'graphic',
    label: 'Graphic Design',
    status: 'active',

    engines: ['nodeTree', 'layout'],
    tools: ['select', 'move', 'resize', 'text', 'shape', 'image'],
    panels: ['layers', 'properties'],

    capabilities: {
        canvas: true,
        timeline: false,
        animation: false,
        transitions: true,
        audio: false,
        video: false,
        codegen: false,
    },

    timeline: null,

    export: {
        formats: ['png', 'jpg', 'svg', 'pdf'],
    },

    // 🔒 Event policy (Graphic Mode)
    allowedEventTypes: new Set([
        // Node lifecycle
        EventTypes.NODE_CREATE,
        EventTypes.NODE_UPDATE,
        EventTypes.NODE_DELETE,

        // Tree structure
        EventTypes.NODE_ATTACH,
        EventTypes.NODE_DETACH,

        // Layout & transform
        EventTypes.NODE_MOVE,
        EventTypes.NODE_RESIZE,
        EventTypes.NODE_REORDER,

        // Selection
        EventTypes.SELECTION_SET,

        // Transitions
        EventTypes.TRANSITION_CREATE,
        EventTypes.TRANSITION_UPDATE,
        EventTypes.TRANSITION_DELETE,
    ]),
};
