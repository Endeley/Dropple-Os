import { GraphicEmptyWorldOverlay } from './GraphicEmptyWorldOverlay.jsx';

export function buildGraphicProjectionSlots() {
    return {
        emptyWorld: ({ workspaceId, modeId, nodeCount }) => (
            <GraphicEmptyWorldOverlay
                workspaceId={workspaceId}
                modeId={modeId}
                nodeCount={nodeCount}
            />
        ),
    };
}
