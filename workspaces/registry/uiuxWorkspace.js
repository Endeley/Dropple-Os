import { EventTypes } from '@/core/events/eventTypes.js';
import { createTimelineCapability } from './timelineCapability.js';
import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';

export const uiuxWorkspace = {
    id: 'uiux',
    label: 'UI / UX Design',

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

    engines: ['nodeTree', 'layout', 'constraints', 'autoLayout', 'vector'],

    tools: ['select', 'move', 'resize', 'text', 'image', 'frame', 'shape', 'path'],

    /*
      Canonical UIUX authoring panel stack
      Activation truth owns exposure.
    */
    panels: ['NodeHeaderPanel', 'LayoutInspector', 'AutoLayoutPanel', 'ContentPanel', 'SemanticsPanel', 'MotionPanel', 'CanvasSurfacePanel', 'UXValidationPanel', 'UXSuggestionsPanel', 'UXRiskImpactPanel', 'UXEventListPanel', 'CertifiedTemplatesPanel', 'ExportPreviewPanel'],

    activeDomains: ['canvas', 'state', 'motion'],

    enabledTriggerTypes: new Set(['pointer_enter', 'pointer_leave', 'click', 'manual']),

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

    allowedEventTypes: [
        EventTypes.VECTOR_CREATE,
        EventTypes.VECTOR_UPDATE,
        EventTypes.VECTOR_DELETE,
        EventTypes.CLOCK_SEEK,
        EventTypes.CLOCK_PLAY,
        EventTypes.CLOCK_PAUSE,
        EventTypes.ANIMATION_KEYFRAME_CREATE,
        EventTypes.ANIMATION_KEYFRAME_UPDATE,
        EventTypes.ANIMATION_KEYFRAME_DELETE,
        EventTypes.MOTION_KEYFRAME_UPDATE,
        EventTypes.MOTION_KEYFRAME_DELETE,
    ],

    timeline: createTimelineCapability({
        readOnly: false,
        allowedProperties: ['opacity', 'translateY'],
    }),

    export: {
        formats: ['react', 'html', 'css'],
    },
};
