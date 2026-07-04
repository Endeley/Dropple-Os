import { UIUXEmptyWorldOverlay } from './UIUXEmptyWorldOverlay.jsx';
import { UIUXFirstExpressionOverlay } from './UIUXFirstExpressionOverlay.jsx';

export function buildUIUXProjectionSlots() {
    return {
        emptyWorld: ({ workspaceId, modeId, nodeCount, worldHistory }) => (
            <UIUXEmptyWorldOverlay
                workspaceId={workspaceId}
                modeId={modeId}
                nodeCount={nodeCount}
                worldHistory={worldHistory}
            />
        ),
        firstExpression: ({ workspaceId, modeId, nodeCount, nodesById, selectedNode, dismissedNodeId, onDismiss }) => (
            <UIUXFirstExpressionOverlay
                workspaceId={workspaceId}
                modeId={modeId}
                nodeCount={nodeCount}
                nodesById={nodesById}
                selectedNode={selectedNode}
                dismissedNodeId={dismissedNodeId}
                onDismiss={onDismiss}
            />
        ),
    };
}
