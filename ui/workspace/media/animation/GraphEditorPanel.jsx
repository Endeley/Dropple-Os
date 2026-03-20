'use client';

import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import {
    selectActiveGraph,
    selectGraphEdges,
    selectGraphErrors,
    selectGraphNodes,
} from '@/runtime/projection/selectors/graphSelectors.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { GraphCanvas } from './GraphCanvas.jsx';
import { canConnect } from './graphConnectionGuards.js';
import { GraphInspectorPanel } from './GraphInspectorPanel.jsx';
import { GraphNodeCreationPanel } from './GraphNodeCreationPanel.jsx';
import { getGraphNodeTemplate } from './graphNodeCatalog.js';
import { useGraphConnectionInteraction } from './useGraphConnectionInteraction.js';
import { useGraphInteraction } from './useGraphInteraction.js';

export function GraphEditorPanel() {
    const interaction = useGraphInteraction();
    const connectionInteraction = useGraphConnectionInteraction();
    const dispatcher = useDispatcher();
    const document = useRuntimeStore((state) => state.document);
    const graphErrors = useRuntimeStore(selectGraphErrors);
    const activeGraphId = useRuntimeStore(
        (state) =>
            state.animation?.activeGraphId ??
            state.workspace?.activeGraphId ??
            state.document?.activeGraphId ??
            null,
    );

    const projectionState = useMemo(
        () => ({
            document,
            animation: {
                activeGraphId,
            },
        }),
        [activeGraphId, document],
    );

    const activeGraph = useMemo(() => selectActiveGraph(projectionState), [projectionState]);
    const nodes = useMemo(() => selectGraphNodes(projectionState), [projectionState]);
    const edges = useMemo(() => selectGraphEdges(projectionState), [projectionState]);
    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === interaction.selectedNodeId) ?? null,
        [interaction.selectedNodeId, nodes],
    );

    function getActiveGraphIdentifier() {
        return activeGraph?.id ?? activeGraphId ?? null;
    }

    function dispatchGraphEvent(type, payload) {
        return dispatcher.dispatch({ type, payload });
    }

    function createNode(type) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        const position = {
            x: 48 - interaction.viewport.x / interaction.viewport.zoom + (nodes.length % 3) * 164,
            y: 48 - interaction.viewport.y / interaction.viewport.zoom + Math.floor(nodes.length / 3) * 104,
        };
        const nextNode = getGraphNodeTemplate(type, {
            id: `${type}-${nanoid(6)}`,
            position,
        });

        if (!nextNode) return;

        void dispatchGraphEvent(EventTypes.GRAPH_NODE_ADD, {
            graphId,
            node: nextNode,
        });
        interaction.selectNode(nextNode.id);
    }

    function patchNode(nodeId, patch) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !nodeId || !patch) return;

        void dispatchGraphEvent(EventTypes.GRAPH_NODE_UPDATE, {
            graphId,
            nodeId,
            patch,
        });
    }

    function deleteNode(nodeId) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !nodeId) return;

        void dispatchGraphEvent(EventTypes.GRAPH_NODE_DELETE, {
            graphId,
            nodeId,
        });

        if (interaction.selectedNodeId === nodeId) {
            interaction.clearSelection();
        }
    }

    function setOutputNode(nodeId) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !nodeId) return;

        void dispatchGraphEvent(EventTypes.GRAPH_OUTPUT_SET, {
            graphId,
            nodeId,
        });
    }

    function commitNodeDrag() {
        const drag = interaction.draggingNode;
        const graphId = getActiveGraphIdentifier();

        if (!drag || !graphId) return;

        if (drag.previewX === drag.originX && drag.previewY === drag.originY) {
            interaction.endNodeDrag();
            return;
        }

        patchNode(drag.id, {
            position: {
                x: drag.previewX,
                y: drag.previewY,
            },
        });
        interaction.endNodeDrag();
    }

    function commitConnection({ from, to, input }) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        void dispatchGraphEvent(EventTypes.GRAPH_CONNECT, {
            graphId,
            from,
            to,
            input,
        }).catch((error) => {
            console.warn(error);
        });
    }

    function disconnectEdge({ from, to, input }) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        void dispatchGraphEvent(EventTypes.GRAPH_DISCONNECT, {
            graphId,
            from,
            to,
            input,
        }).catch((error) => {
            console.warn(error);
        });
    }

    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                borderRadius: 18,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                background:
                    'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.84) 100%)',
                backdropFilter: 'blur(12px)',
                overflow: 'hidden',
            }}>
            <GraphNodeCreationPanel
                disabled={!activeGraph}
                onCreateNode={createNode}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <GraphCanvas
                    activeGraph={activeGraph}
                    activeGraphId={activeGraphId}
                    nodes={nodes}
                    edges={edges}
                    interaction={interaction}
                    connectionInteraction={connectionInteraction}
                    canConnect={(payload) => canConnect({ ...payload, graph: activeGraph })}
                    onCommitNodeDrag={commitNodeDrag}
                    onCommitConnection={commitConnection}
                    onDisconnectEdge={disconnectEdge}
                />
            </div>
            <GraphInspectorPanel
                activeGraph={activeGraph}
                selectedNode={selectedNode}
                graphErrors={graphErrors}
                onPatchNode={patchNode}
                onDeleteNode={deleteNode}
                onSetOutputNode={setOutputNode}
            />
        </div>
    );
}
