import { createTimelineCapability } from './timelineCapability.js';

export const mediaWorkspace = {
    id: 'media',
    label: 'Media Studio',
    status: 'active',

    engines: ['timeline', 'animation', 'media'],
    tools: ['select', 'move', 'keyframe', 'cut', 'marker'],
    panels: ['MediaBrowserPanel', 'MediaTimelinePanel', 'MediaInspectorPanel'],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: true,
        audio: true,
        video: true,
        codegen: false,
    },

    timeline: createTimelineCapability({
        readOnly: false,
        allowedProperties: ['x', 'y', 'scale', 'rotation', 'opacity', 'volume'],
    }),

    export: {
        formats: ['mp4', 'gif', 'lottie', 'mp3', 'wav'],
    },

    allowedEventTypes: [],

    media: {
        defaultMode: 'animation',
        modes: ['animation', 'video', 'podcast'],
        sharedPanels: [
            'MediaBrowserPanel',
            'MediaTimelinePanel',
            'MediaInspectorPanel',
            'MediaTransportBar',
        ],
    },
};
