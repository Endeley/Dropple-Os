import { UIUXEmptyWorldOverlay } from './UIUXEmptyWorldOverlay.jsx';
import { UIUXFirstExpressionOverlay } from './UIUXFirstExpressionOverlay.jsx';
import { UIUXProjectEmergenceOverlay } from './UIUXProjectEmergenceOverlay.jsx';

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
        // Project Emergence Projection
        //
        // Purpose:
        // Reveal truthful containment.
        //
        // This projection may reveal an existing parent/child relationship
        // already owned by the runtime.
        //
        // It may never infer, fabricate, explain, or manage containment.
        projectEmergence: ({ workspaceId, modeId, nodeCount, nodesById, selectedNode }) => (
            <UIUXProjectEmergenceOverlay
                workspaceId={workspaceId}
                modeId={modeId}
                nodeCount={nodeCount}
                nodesById={nodesById}
                selectedNode={selectedNode}
            />
        ),
    };
}
