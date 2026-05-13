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
        interpretedToolPriority: 100,
        interpretedTools: Object.freeze([
            Object.freeze({ id: 'select', label: 'Select' }),
            Object.freeze({
                id: 'move',
                label: 'Move',
                group: 'edit',
                capabilityTags: ['graph.transform'],
                intentTopics: ['layout/move'],
            }),
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
        tools: Object.freeze(['rig-select', 'rig-move', 'exec-contract-shared', 'exec-version-minor-shared', 'exec-version-major-shared', 'exec-version-major-migrated-shared']),
        interpretedToolPriority: 50,
        interpretedTools: Object.freeze([
            Object.freeze({
                id: 'move',
                label: 'Rig Move Shared',
                group: 'edit',
                sessionType: 'move',
                capabilityTags: ['rig.transform'],
                intentTopics: ['rig/move'],
            }),
            Object.freeze({
                id: 'exec-contract-shared',
                label: 'Exec Contract Shared',
                group: 'edit',
                sessionType: 'move',
                capabilityTags: ['rig.exec'],
                intentTopics: ['rig/execute'],
            }),
            Object.freeze({
                id: 'exec-version-minor-shared',
                label: 'Exec Version Minor Shared',
                group: 'edit',
                sessionType: 'move',
                executionSignatureVersion: '1.0',
                capabilityTags: ['rig.exec.version'],
                intentTopics: ['rig/execute/versioned'],
            }),
            Object.freeze({
                id: 'exec-version-major-shared',
                label: 'Exec Version Major Shared',
                group: 'edit',
                sessionType: 'move',
                executionSignatureVersion: '1.0',
                capabilityTags: ['rig.exec.version'],
                intentTopics: ['rig/execute/versioned'],
            }),
            Object.freeze({
                id: 'exec-version-major-migrated-shared',
                label: 'Exec Version Major Migrated Shared',
                group: 'edit',
                sessionType: 'move',
                executionSignatureVersion: '1.0',
                capabilityTags: ['rig.exec.version'],
                intentTopics: ['rig/execute/versioned'],
            }),
            Object.freeze({ id: 'rig-select', label: 'Rig Select', handlerFamily: 'utility' }),
            Object.freeze({ id: 'rig-move', label: 'Rig Move', sessionType: 'move' }),
        ]),
        ui: Object.freeze({
            overlays: Object.freeze([
                Object.freeze({
                    component: RigControllerOverlay,
                    priority: 10,
                }),
            ]),
        }),
        lifecycle: Object.freeze({}),
    }),

    stateMachine: Object.freeze({
        id: 'stateMachine',
        tools: Object.freeze(['exec-contract-shared', 'exec-version-minor-shared', 'exec-version-major-shared', 'exec-version-major-migrated-shared']),
        interpretedToolPriority: 60,
        interpretedTools: Object.freeze([
            Object.freeze({
                id: 'exec-contract-shared',
                label: 'Exec Contract Shared',
                group: 'edit',
                sessionType: 'cameraMove',
                capabilityTags: ['state.exec'],
                intentTopics: ['state/execute'],
            }),
            Object.freeze({
                id: 'exec-version-minor-shared',
                label: 'Exec Version Minor Shared',
                group: 'edit',
                sessionType: 'move',
                executionSignatureVersion: '1.1',
                capabilityTags: ['state.exec.version'],
                intentTopics: ['state/execute/versioned'],
            }),
            Object.freeze({
                id: 'exec-version-major-shared',
                label: 'Exec Version Major Shared',
                group: 'edit',
                sessionType: 'move',
                executionSignatureVersion: '2.0',
                capabilityTags: ['state.exec.version'],
                intentTopics: ['state/execute/versioned'],
            }),
            Object.freeze({
                id: 'exec-version-major-migrated-shared',
                label: 'Exec Version Major Migrated Shared',
                group: 'edit',
                sessionType: 'move',
                executionSignatureVersion: '2.0',
                capabilityTags: ['state.exec.version'],
                intentTopics: ['state/execute/versioned'],
            }),
        ]),
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
