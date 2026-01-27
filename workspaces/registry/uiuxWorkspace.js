import { createTimelineCapability } from './timelineCapability.js';
import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';

export const uiuxWorkspace = {
    id: 'uiux',
    label: 'UI / UX Design',

    // 🔹 UI SEMANTIC FLAG (READ-ONLY UX MODE)
    profile: 'ux-validation',

    extends: 'graphic',
    status: 'active',

    canvasPolicy: {
        ...DefaultCanvasPolicy,
        type: 'infinite',
        origin: 'center',
        allowPan: true,
        allowZoom: true,
        showPageBounds: false,
        snapToBounds: false,
    },
    canvasSurface: {
        type: 'dots',
        gridSize: 8,
        snap: false,
    },

    engines: ['nodeTree', 'layout', 'constraints', 'autoLayout'],
    tools: ['select', 'move', 'resize', 'text', 'shape', 'image'],
    panels: ['layers', 'properties', 'tokens'],

    capabilities: {
        canvas: true,
        timeline: true,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    timeline: createTimelineCapability({
        readOnly: true,
        allowedProperties: ['x', 'y', 'opacity'],
    }),

    export: {
        formats: ['react', 'html', 'css'],
    },
};
