'use client';

import { GraphEditorPanel } from '@/ui/workspace/media/animation/GraphEditorPanel.jsx';
import { RigControllerOverlay } from '@/ui/rigging/RigControllerOverlay.jsx';
import { createTokenAuthoringCommandLayer } from '@/ui/workspace/system/tokenAuthoringIntent.js';
import { TokenVersionGraphPanel } from '@/ui/workspace/system/TokenVersionGraphPanel.jsx';

function safeEmit(context, event, capability, phase = 'emit') {
    try {
        const emit = context?.emit;
        if (typeof emit !== 'function') return null;

        const result = emit(event);

        if (result && typeof result.catch === 'function') {
            result.catch((error) => {
                console.error(`[Capability:${capability}] ${phase} failed`, error);
            });
        }

        return result;
    } catch (error) {
        console.error(`[Capability:${capability}] ${phase} failed`, error);
        return null;
    }
}

function emitToolRegistration(context, capability, tools) {
    return safeEmit(
        context,
        {
            type: 'capability.tools.register.requested',
            payload: {
                source: capability,
                tools: Array.isArray(tools) ? tools : [],
            },
        },
        capability,
        'register-tools',
    );
}

function emitToolUnregistration(context, capability) {
    return safeEmit(
        context,
        {
            type: 'capability.tools.unregister.requested',
            payload: {
                source: capability,
            },
        },
        capability,
        'unregister-tools',
    );
}

export const CAPABILITY_COMPONENTS = Object.freeze({
    graph: Object.freeze({
        id: 'graph',
        tools: Object.freeze(['select', 'move', 'resize', 'rotate', 'pan', 'frame', 'shape']),
        interpretedTools: Object.freeze([
            Object.freeze({ id: 'select', label: 'Select' }),
            Object.freeze({ id: 'move', label: 'Move' }),
            Object.freeze({ id: 'resize', label: 'Resize' }),
            Object.freeze({ id: 'rotate', label: 'Rotate' }),
            Object.freeze({ id: 'pan', label: 'Pan' }),
            Object.freeze({ id: 'frame', label: 'Frame', createsNode: true, nodeType: 'frame' }),
            Object.freeze({ id: 'shape', label: 'Shape', createsNode: true, nodeType: 'shape' }),
        ]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([
                Object.freeze({
                    component: GraphEditorPanel,
                    priority: 10,
                }),
            ]),
        }),
        lifecycle: Object.freeze({}),
    }),

    timeline: Object.freeze({
        id: 'timeline',
        tools: Object.freeze(['keyframe', 'cut', 'trim', 'overlay']),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({
            onMount(context) {
                emitToolRegistration(context, 'timeline', ['keyframe', 'cut', 'trim', 'overlay']);
            },
            onUnmount(context) {
                emitToolUnregistration(context, 'timeline');
            },
        }),
    }),

    rig: Object.freeze({
        id: 'rig',
        tools: Object.freeze(['rig-select', 'rig-move']),
        ui: Object.freeze({
            overlays: Object.freeze([
                Object.freeze({
                    component: RigControllerOverlay,
                    priority: 10,
                }),
            ]),
        }),
        lifecycle: Object.freeze({
            onMount(context) {
                emitToolRegistration(context, 'rig', ['rig-select', 'rig-move']);
            },
            onUnmount(context) {
                emitToolUnregistration(context, 'rig');
            },
        }),
    }),

    stateMachine: Object.freeze({
        id: 'stateMachine',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),

    'token-authoring': Object.freeze({
        id: 'token-authoring',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        authoring: Object.freeze({
            createCommandLayer: createTokenAuthoringCommandLayer,
        }),
        lifecycle: Object.freeze({}),
    }),

    'theme-authoring': Object.freeze({
        id: 'theme-authoring',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        authoring: Object.freeze({
            createCommandLayer: createTokenAuthoringCommandLayer,
        }),
        lifecycle: Object.freeze({}),
    }),

    'token-versioning': Object.freeze({
        id: 'token-versioning',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([
                Object.freeze({
                    component: TokenVersionGraphPanel,
                    priority: 10,
                }),
            ]),
        }),
        authoring: Object.freeze({
            createCommandLayer: createTokenAuthoringCommandLayer,
        }),
        lifecycle: Object.freeze({}),
    }),

    'token-review': Object.freeze({
        id: 'token-review',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        authoring: Object.freeze({
            createCommandLayer: createTokenAuthoringCommandLayer,
        }),
        lifecycle: Object.freeze({}),
    }),

    'ai-assist': Object.freeze({
        id: 'ai-assist',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),

    'ai-explain': Object.freeze({
        id: 'ai-explain',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),

    'ai-generate': Object.freeze({
        id: 'ai-generate',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),

    'guided-navigation': Object.freeze({
        id: 'guided-navigation',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),

    'step-through': Object.freeze({
        id: 'step-through',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),

    'guided-explain': Object.freeze({
        id: 'guided-explain',
        tools: Object.freeze([]),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({}),
    }),
});

export const CAPABILITY_REGISTRY = CAPABILITY_COMPONENTS;
