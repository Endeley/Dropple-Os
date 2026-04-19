'use client';

import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import {
    graphIntentDisable,
    graphIntentEnable,
    graphIntentConnectionCreate,
    graphIntentConnectionDelete,
    graphIntentMetadataUpdate,
    graphIntentNodeCreate,
    graphIntentNodeDelete,
    graphIntentNodeUpdate,
    graphIntentOutputSet,
    graphIntentSetPriority,
    graphIntentSetRig,
} from '@/ui/graph/graphIntent.js';
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

    function createNode(type) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        const position = {
            x: 48 - (graph?.viewport?.x ?? 0) / (graph?.viewport?.zoom ?? 1) + (nodes.length % 3) * 164,
            y: 48 - (graph?.viewport?.y ?? 0) / (graph?.viewport?.zoom ?? 1) + Math.floor(nodes.length / 3) * 104,
        };
        const nodeId = `${type}-${nanoid(6)}`;

        graphIntentNodeCreate({
            graphId,
            nodeId,
            nodeType: type,
            position,
        });
        emitGraphIntent(selectGraphNode(nodeId));
    }

    function patchNode(nodeId, patch) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !nodeId || !patch) return;

        graphIntentNodeUpdate({
            graphId,
            nodeId,
            patch,
        });
    }

    function setGraphEnabled(enabled) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        if (enabled) {
            graphIntentEnable({ graphId });
            return;
        }

        graphIntentDisable({ graphId });
    }

    function setGraphRig(rigId) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        graphIntentSetRig({
            graphId,
            rigId,
        });
    }

    function setGraphPriority(priority) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !Number.isFinite(priority)) return;

        graphIntentSetPriority({
            graphId,
            priority,
        });
    }

    function patchGraphMetadata(patch) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !patch) return;

        graphIntentMetadataUpdate({
            graphId,
            patch,
        });
    }

    function deleteNode(nodeId) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !nodeId) return;

        graphIntentNodeDelete({
            graphId,
            nodeId,
        });
    }

    function setOutputNode(nodeId) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId || !nodeId) return;

        graphIntentOutputSet({
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

        graphIntentConnectionCreate({
            graphId,
            from,
            to,
            input,
        });
    }

    function disconnectEdge({ from, to, input }) {
        const graphId = getActiveGraphIdentifier();
        if (!graphId) return;

        graphIntentConnectionDelete({
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
                onSetGraphEnabled={setGraphEnabled}
                onSetGraphRig={setGraphRig}
                onSetGraphPriority={setGraphPriority}
                onPatchGraphMetadata={patchGraphMetadata}
                onPatchNode={patchNode}
                onDeleteNode={deleteNode}
                onSetOutputNode={setOutputNode}
            />
        </div>
    );
}
