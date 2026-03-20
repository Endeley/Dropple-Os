'use client';

import { useMemo } from 'react';
import { EventTypes } from '@/core/events/eventTypes.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    selectActiveGraph,
    selectGraphEdges,
    selectGraphNodes,
} from '@/runtime/projection/selectors/graphSelectors.js';
import { GraphEdgeView } from './GraphEdgeView.jsx';
import { GraphNodeView } from './GraphNodeView.jsx';
import { useGraphInteraction } from './useGraphInteraction.js';

export function GraphCanvas() {
    const interaction = useGraphInteraction();
    const dispatcher = useDispatcher();
    const document = useRuntimeStore((state) => state.document);
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
    const { viewport } = interaction;

    const graphEdges = useMemo(() => {
        const nodeCenter = (node) => {
            const dragPreview =
                interaction.draggingNode?.id === node.id
                    ? {
                          x: interaction.draggingNode.previewX,
                          y: interaction.draggingNode.previewY,
                      }
                    : null;
            const x = dragPreview?.x ?? node.position.x;
            const y = dragPreview?.y ?? node.position.y;

            return {
                x: x + 60,
                y: y + 32,
            };
        };

        const nodePositions = new Map(
            nodes.map((node) => [node.id, nodeCenter(node)]),
        );

        return edges.map((edge) => ({
            ...edge,
            sourcePosition: nodePositions.get(edge.from) ?? { x: 0, y: 0 },
            targetPosition: nodePositions.get(edge.to) ?? { x: 100, y: 100 },
        }));
    }, [edges, interaction.draggingNode, nodes]);

    function commitNodeDrag() {
        const drag = interaction.draggingNode;
        const graphId = activeGraph?.id ?? activeGraphId ?? null;

        if (!drag || !graphId) return;

        if (drag.previewX === drag.originX && drag.previewY === drag.originY) {
            interaction.endNodeDrag();
            return;
        }

        void dispatcher.dispatch({
            type: EventTypes.GRAPH_NODE_UPDATE,
            payload: {
                graphId,
                nodeId: drag.id,
                patch: {
                    position: {
                        x: drag.previewX,
                        y: drag.previewY,
                    },
                },
            },
        });

        interaction.endNodeDrag();
    }

    function handleWheel(event) {
        event.preventDefault();
        interaction.updateZoom(event.deltaY);
    }

    function handleMouseDown(event) {
        if (event.target !== event.currentTarget) return;
        interaction.clearSelection();
        interaction.startPan(event.clientX, event.clientY);
    }

    function handleMouseMove(event) {
        if (interaction.draggingNode) {
            interaction.updateNodeDrag(event.clientX, event.clientY);
            return;
        }

        if (interaction.panning) {
            interaction.updatePanFromPointer(event.clientX, event.clientY);
        }
    }

    function handleMouseUp() {
        interaction.endPan();
        commitNodeDrag();
    }

    return (
        <div
            aria-label='Animation graph canvas'
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: 18,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                background:
                    'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.84) 100%)',
                backdropFilter: 'blur(12px)',
            }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                    color: '#e2e8f0',
                }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Graph
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {activeGraph?.id ?? 'No active graph'}
                </div>
            </div>

            {!nodes.length ? (
                <div
                    style={{
                        display: 'grid',
                        placeItems: 'center',
                        height: 'calc(100% - 49px)',
                        color: '#94a3b8',
                        fontSize: 13,
                    }}>
                    No graph nodes to display.
                </div>
            ) : (
                <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 49px)' }}>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                            transformOrigin: '0 0',
                        }}>
                        <svg
                            aria-hidden='true'
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'visible',
                            }}>
                            {graphEdges.map((edge) => (
                                <GraphEdgeView key={edge.id} edge={edge} />
                            ))}
                        </svg>
                        <div style={{ position: 'absolute', inset: 0 }}>
                            {nodes.map((node) => (
                                <GraphNodeView
                                    key={node.id}
                                    node={node}
                                    interaction={interaction}
                                    onCommitNodeDrag={commitNodeDrag}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
