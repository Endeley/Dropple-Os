'use client';

import CanvasHost from './CanvasHost.jsx';
import NodeLayer from './NodeLayer.jsx';
import GhostLayer from './GhostLayer.jsx';
import GuideLayer from './GuideLayer.jsx';
import SelectionLayer from './SelectionLayer.jsx';
import CollabLayer from './CollabLayer.jsx';
import { useRenderState } from '@/runtime/bridge/selectRenderState.js';

export default function CanvasRoot() {
    const state = useRenderState();
    const nodes = state?.nodes || {};
    const rootIds = state?.rootIds || [];

    return (
        <CanvasHost>
            <NodeLayer />
            <GhostLayer />
            <GuideLayer />
            <SelectionLayer />
            <CollabLayer />
        </CanvasHost>
    );
}
