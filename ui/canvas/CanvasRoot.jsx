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

export default function CanvasRoot({ workspaceId }) {
    const workspace = resolveWorkspacePolicy(workspaceId);
    const timeline = getRuntimeState()?.timeline?.timelines?.default;

    return (
        <CanvasHost>
            <NodeLayer />
            <GhostLayer />
            <GuideLayer />
            <SelectionLayer />
            <CollabLayer />
            {workspace?.capabilities?.timeline && <TimelinePanel timeline={timeline} />}
        </CanvasHost>
    );
}
