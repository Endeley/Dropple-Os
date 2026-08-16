import { EventTypes } from '@/core/events/eventTypes.js';
import { createTimelineCapability } from './timelineCapability.js';
import { DefaultCanvasPolicy } from '@/core/contracts/CanvasPolicy.js';
import { SHARED_AUTHORING_TOOL_BASELINE } from '@/platform/capabilities/sharedActivationBaseline.js';

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

    tools: [...SHARED_AUTHORING_TOOL_BASELINE, 'text', 'image', 'frame', 'shape', 'path'],

    /*
      Canonical UIUX authoring panel stack
      Activation truth owns exposure.
    */
    panels: ['SelectionActionsPanel', 'UIUXLanguageProjectionPanel', 'NodeHeaderPanel', 'LayoutInspector', 'AutoLayoutPanel', 'TypographyPanel', 'AppearancePanel', 'ContentPanel', 'SemanticsPanel', 'MotionPanel', 'CanvasSurfacePanel', 'UXValidationPanel', 'UXSuggestionsPanel', 'UXRiskImpactPanel', 'UXEventListPanel', 'CertifiedTemplatesPanel', 'ExportPreviewPanel'],

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
        EventTypes.NODE_WRAP,
        EventTypes.NODE_UNWRAP,
        EventTypes.ALIGN_NODES,
        EventTypes.DISTRIBUTE_NODES,
        EventTypes.VECTOR_CREATE,
        EventTypes.VECTOR_UPDATE,
        EventTypes.VECTOR_DELETE,
        EventTypes.CLOCK_SEEK,
        EventTypes.CLOCK_PLAY,
        EventTypes.CLOCK_PAUSE,
        EventTypes.MOTION_CLIP_CREATE,
        EventTypes.MOTION_CLIP_UPDATE,
        EventTypes.MOTION_CLIP_DELETE,
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
