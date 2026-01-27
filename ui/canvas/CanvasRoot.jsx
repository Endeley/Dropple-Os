'use client';

import CanvasHost from './CanvasHost.jsx';
import NodeLayer from './NodeLayer.jsx';
import GhostLayer from './GhostLayer.jsx';
import GuideLayer from './GuideLayer.jsx';
import SelectionLayer from './SelectionLayer.jsx';
import CollabLayer from './CollabLayer.jsx';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import TimelinePanel from '@/ui/timeline/TimelinePanel.jsx';
import { perfStart, perfEnd } from '@/perf/perfTracker.js';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { CanvasSurface } from '@/ui/canvas/surface/CanvasSurface.jsx';
import { CanvasOriginMarker } from '@/ui/canvas/CanvasOriginMarker.jsx';

export default function CanvasRoot({ workspaceId }) {
    perfStart('canvas.render');
    const workspace = resolveWorkspacePolicy(workspaceId);
    const designState = getRuntimeState();
    const viewport = useWorkspaceState((state) => state.viewport);
    const canvasSurface = useWorkspaceState((state) => state.canvasSurface);
    const canvasPolicy = useWorkspaceState((state) => state.canvasPolicy);

    const content = (
        <CanvasHost>
            <CanvasSurface surface={canvasSurface} viewport={viewport} />
            {canvasPolicy?.type === 'infinite' && <CanvasOriginMarker />}
            <NodeLayer />
            <GhostLayer />
            <GuideLayer />
            <SelectionLayer />
            <CollabLayer />
            {workspace?.capabilities?.timeline && <TimelinePanel designState={designState} />}
        </CanvasHost>
    );

    perfEnd('canvas.render');
    return content;
}
