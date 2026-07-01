import { GraphicEmptyWorldOverlay } from './GraphicEmptyWorldOverlay.jsx';
import { GraphicFirstExpressionOverlay } from './GraphicFirstExpressionOverlay.jsx';

export function buildGraphicProjectionSlots() {
    return {
        emptyWorld: ({ workspaceId, modeId, nodeCount }) => (
            <GraphicEmptyWorldOverlay
                workspaceId={workspaceId}
                modeId={modeId}
                nodeCount={nodeCount}
            />
        ),
        firstExpression: ({ workspaceId, modeId, nodeCount, selectedNode, dismissedNodeId, onDismiss }) => (
            <GraphicFirstExpressionOverlay
                workspaceId={workspaceId}
                modeId={modeId}
                nodeCount={nodeCount}
                selectedNode={selectedNode}
                dismissedNodeId={dismissedNodeId}
                onDismiss={onDismiss}
            />
        ),
    };
}
