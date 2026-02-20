import { EventTypes } from '@/core/events/eventTypes.js';

export const reviewWorkspace = {
    id: 'review',
    label: 'Review',
    status: 'active',

    engines: ['replay'],
    tools: [],
    panels: ['NodeHeaderPanel', 'ExportPreviewPanel'],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
        editing: false,
    },

    timeline: {
        enabled: true,
        readOnly: true,
    },

    export: null,

    // 🔒 Review mode should be read-only
    allowedEventTypes: [
        EventTypes.SELECTION_SET,
    ],
};
