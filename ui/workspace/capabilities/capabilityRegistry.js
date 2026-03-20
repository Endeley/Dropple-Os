'use client';

import { GraphEditorPanel } from '@/ui/workspace/media/animation/GraphEditorPanel.jsx';
import { RigControllerOverlay } from '@/ui/rigging/RigControllerOverlay.jsx';

export const CAPABILITY_COMPONENTS = Object.freeze({
    graph: Object.freeze({
        surfacePanels: Object.freeze([
            Object.freeze({
                component: GraphEditorPanel,
                priority: 10,
            }),
        ]),
    }),
    timeline: Object.freeze({
        surfacePanels: Object.freeze([]),
    }),
    rig: Object.freeze({
        overlays: Object.freeze([
            Object.freeze({
                component: RigControllerOverlay,
                priority: 10,
            }),
        ]),
    }),
    stateMachine: Object.freeze({
        surfacePanels: Object.freeze([]),
    }),
});
