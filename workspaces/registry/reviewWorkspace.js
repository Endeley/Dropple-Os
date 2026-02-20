import { EventTypes } from '@/core/events/eventTypes.js';

export const reviewWorkspace = {
    id: 'review',
    label: 'Review',
    status: 'active',

    engines: ['replay'],
    tools: [],
    panels: ['rubric', 'annotations'],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    timeline: {
        enabled: true,
        readOnly: true,
    },

    export: null,

    // 🔒 Review mode should be read-only
    allowedEventTypes: new Set([
        EventTypes.SELECTION_SET,
    ]),
};
