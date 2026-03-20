'use client';

import { GraphEditorPanel } from '@/ui/workspace/media/animation/GraphEditorPanel.jsx';
import { RigControllerOverlay } from '@/ui/rigging/RigControllerOverlay.jsx';
import {
    registerTools,
    unregisterTools,
} from '@/runtime/actions/toolActions.js';

function safeDispatch(context, action, capability) {
    try {
        const result = context.dispatch?.(action);
        if (result && typeof result.catch === 'function') {
            result.catch((error) => {
                console.error(`[Capability:${capability}] dispatch failed`, error);
            });
        }
        return result;
    } catch (error) {
        console.error(`[Capability:${capability}] dispatch failed`, error);
        return null;
    }
}

export const CAPABILITY_COMPONENTS = Object.freeze({
    graph: Object.freeze({
        id: 'graph',
        tools: Object.freeze(['select', 'pan', 'frame', 'shape']),
        ui: Object.freeze({
            surfacePanels: Object.freeze([
                Object.freeze({
                    component: GraphEditorPanel,
                    priority: 10,
                }),
            ]),
        }),
        lifecycle: Object.freeze({
            onMount(context) {
                safeDispatch(
                    context,
                    registerTools({
                        source: 'graph',
                        tools: ['select', 'pan', 'frame', 'shape'],
                    }),
                    'graph',
                );
            },
            onUnmount(context) {
                safeDispatch(
                    context,
                    unregisterTools({
                        source: 'graph',
                    }),
                    'graph',
                );
            },
        }),
    }),
    timeline: Object.freeze({
        id: 'timeline',
        tools: Object.freeze(['keyframe', 'cut', 'trim', 'overlay']),
        ui: Object.freeze({
            surfacePanels: Object.freeze([]),
        }),
        lifecycle: Object.freeze({
            onMount(context) {
                safeDispatch(
                    context,
                    registerTools({
                        source: 'timeline',
                        tools: ['keyframe', 'cut', 'trim', 'overlay'],
                    }),
                    'timeline',
                );
            },
            onUnmount(context) {
                safeDispatch(
                    context,
                    unregisterTools({
                        source: 'timeline',
                    }),
                    'timeline',
                );
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
                safeDispatch(
                    context,
                    registerTools({
                        source: 'rig',
                        tools: ['rig-select', 'rig-move'],
                    }),
                    'rig',
                );
            },
            onUnmount(context) {
                safeDispatch(
                    context,
                    unregisterTools({
                        source: 'rig',
                    }),
                    'rig',
                );
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
});

export const CAPABILITY_REGISTRY = CAPABILITY_COMPONENTS;
