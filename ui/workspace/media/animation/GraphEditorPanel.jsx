'use client';

import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import { EventTypes } from '@/core/events/eventTypes.js';
import { useWorkspaceVisualState } from '@/runtime/projection';
import {
    clearGraphSelection,
    endGraphConnection,
    endGraphDrag,
    endGraphPan,
    selectGraphNode,
} from '@/runtime/graph/index.js';
import { emitGraphIntent } from '@/ui/bridges/graphIntentBridge.js';
import { GraphCanvas } from './GraphCanvas.jsx';
import { canConnect } from './graphConnectionGuards.js';
import { GraphInspectorPanel } from './GraphInspectorPanel.jsx';
import { GraphNodeCreationPanel } from './GraphNodeCreationPanel.jsx';
import { getGraphNodeTemplate } from './graphNodeCatalog.js';

const EMPTY_GRAPH_ITEMS = [];

export function GraphEditorPanel() {
    const graph = useWorkspaceVisualState((state) => state.graph);
    const activeGraph = graph?.activeGraph ?? null;
    const activeGraphId = graph?.activeGraphId ?? null;
    const nodes = graph?.nodes ?? EMPTY_GRAPH_ITEMS;
    const edges = graph?.edges ?? EMPTY_GRAPH_ITEMS;
    const graphErrors = graph?.errors ?? EMPTY_GRAPH_ITEMS;
    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === graph?.selection?.primary) ?? null,
        [graph?.selection?.primary, nodes],
    );

    function getActiveGraphIdentifier() {
        return activeGraph?.id ?? activeGraphId ?? null;
    }

    function dispatchGraphEvent(type, payload) {
        emitGraphIntent({ type, payload });
        return null;
    }

    function createNode(type) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        const position = {
            x: 48 - (graph?.viewport?.x ?? 0) / (graph?.viewport?.zoom ?? 1) + (nodes.length % 3) * 164,
            y: 48 - (graph?.viewport?.y ?? 0) / (graph?.viewport?.zoom ?? 1) + Math.floor(nodes.length / 3) * 104,
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
        emitGraphIntent(selectGraphNode(nextNode.id));
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

    function patchGraph(patch) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !patch) return;

        void dispatchGraphEvent(EventTypes.GRAPH_UPDATE, {
            graphId,
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
        const drag = graph?.drag;
        const graphId = getActiveGraphIdentifier();

        if (!drag || !graphId) return;

        const startPointer = drag.startPointer ?? { x: 0, y: 0 };
        const currentPointer = drag.currentPointer ?? startPointer;
        const origin = drag.origin ?? { x: 0, y: 0 };
        const nextPosition = {
            x: Number(origin.x ?? 0) + Number(currentPointer.x ?? 0) - Number(startPointer.x ?? 0),
            y: Number(origin.y ?? 0) + Number(currentPointer.y ?? 0) - Number(startPointer.y ?? 0),
        };

        if (nextPosition.x === Number(origin.x ?? 0) && nextPosition.y === Number(origin.y ?? 0)) {
            emitGraphIntent(endGraphDrag());
            return;
        }

        patchNode(drag.nodeId, {
            position: {
                x: nextPosition.x,
                y: nextPosition.y,
            },
        });
        emitGraphIntent(endGraphDrag());
    }

    function commitConnection({ from, to, input }) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        void dispatchGraphEvent(EventTypes.GRAPH_CONNECT, {
            graphId,
            from,
            to,
            input,
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
                    graph={graph}
                    canConnect={(payload) => canConnect({ ...payload, graph: activeGraph })}
                    onCommitNodeDrag={commitNodeDrag}
                    onCommitConnection={commitConnection}
                    onDisconnectEdge={disconnectEdge}
                    onDispatchEvent={emitGraphIntent}
                    onClearSelection={() => emitGraphIntent(clearGraphSelection())}
                    onEndConnection={() => emitGraphIntent(endGraphConnection())}
                    onEndPan={() => emitGraphIntent(endGraphPan())}
                />
            </div>
            <GraphInspectorPanel
                activeGraph={activeGraph}
                selectedNode={selectedNode}
                graphErrors={graphErrors}
                onPatchGraph={patchGraph}
                onPatchNode={patchNode}
                onDeleteNode={deleteNode}
                onSetOutputNode={setOutputNode}
            />
        </div>
    );
}
