// workspaces/registry/graphicWorkspace.js
import { EventTypes } from '@/core/events/eventTypes.js';
import { SHARED_AUTHORING_TOOL_BASELINE } from './sharedActivationBaseline.js';

export const graphicWorkspace = {
    id: 'graphic',
    label: 'Graphic Design',
    status: 'active',

    engines: ['nodeTree', 'layout', 'vector'],
    tools: [...SHARED_AUTHORING_TOOL_BASELINE, 'text', 'shape', 'image'],
    panels: [
        'NodeHeaderPanel',
        'LayoutInspector',
        'AutoLayoutPanel',
        'ContentPanel',
        'SemanticsPanel',
        'ExportPreviewPanel',
    ],

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
    allowedEventTypes: [
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
        EventTypes.ALIGN_NODES,
        EventTypes.DISTRIBUTE_NODES,
        'node.layout.update',
        'node.layout.bulk',
        'node.layout.rotate',
        'node.layout.setConstraint',
        'node.layout.clearConstraint',
        'node.layout.setAutoLayout',
        'node.layout.clearAutoLayout',
        'layout.node.patch',
        'layout.container.set',
        'layout.container.remove',
        'layout.sizing.set',
        'layout.constraints.set',
        'layout.padding.set',
        'layout.gap.set',
        'layout.align.set',
        EventTypes.VECTOR_CREATE,
        EventTypes.VECTOR_UPDATE,
        EventTypes.VECTOR_DELETE,

        // Selection
        EventTypes.SELECTION_SET,

        // Transitions
        EventTypes.TRANSITION_CREATE,
        EventTypes.TRANSITION_UPDATE,
        EventTypes.TRANSITION_DELETE,
    ],
};
