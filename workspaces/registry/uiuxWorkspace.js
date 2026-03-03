import { createTimelineCapability } from './timelineCapability.js';
import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';

export const uiuxWorkspace = {
    id: 'uiux',
    label: 'UI / UX Design',

    // 🔹 UI SEMANTIC FLAG (AUTHORING UX MODE)
    profile: 'uiux-authoring',

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
    tools: ['select', 'move', 'resize', 'text', 'image', 'frame', 'shape'],
    panels: [
        'NodeHeaderPanel',
        'SemanticsPanel',
        'ExportPreviewPanel',
        'CanvasSurfacePanel',
    ],
    activeDomains: ['canvas', 'state', 'motion'],
    enabledTriggerTypes: new Set([
        'pointer_enter',
        'pointer_leave',
        'click',
        'manual',
    ]),

    capabilities: {
        canvas: true,
        timeline: true,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
        'node:create': true,
        rootNodeTypes: ['frame'],
        allowFrameNesting: false,
        allowRootShapes: false,
        autoLayoutParents: ['container'],
    },

    allowedEventTypes: [],

    timeline: createTimelineCapability({
        readOnly: true,
        allowedProperties: ['x', 'y', 'opacity'],
    }),

    export: {
        formats: ['react', 'html', 'css'],
    },
};
