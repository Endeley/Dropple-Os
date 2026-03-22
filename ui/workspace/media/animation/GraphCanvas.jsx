'use client';

import { useCallback, useMemo, useRef } from 'react';
import {
    startGraphConnection,
    startGraphDrag,
    startGraphPan,
    selectGraphNode,
    updateGraphConnection,
    updateGraphDrag,
    updateGraphPan,
    zoomGraphViewport,
} from '@/runtime/graph/index.js';
import { GraphEdgeView } from './GraphEdgeView.jsx';
import { GraphNodeView } from './GraphNodeView.jsx';
import { getVisibleInputs } from './graphNodePorts.js';

const EMPTY_GRAPH_PREVIEW_POSITIONS = {};

export function GraphCanvas({
    activeGraph,
    activeGraphId,
    nodes,
    edges,
    graph,
    canConnect,
    onCommitNodeDrag,
    onCommitConnection,
    onDisconnectEdge,
    onDispatchEvent,
    onClearSelection,
    onEndConnection,
    onEndPan,
}) {
    const canvasBodyRef = useRef(null);
    const viewport = graph?.viewport ?? { x: 0, y: 0, zoom: 1 };
    const selectionIds = graph?.selection?.ids ?? [];
    const drag = graph?.drag ?? null;
    const connection = graph?.connection ?? null;
    const dragPreviewPositions = graph?.dragPreviewPositions ?? EMPTY_GRAPH_PREVIEW_POSITIONS;

    function toLocalGraphPoint(clientX, clientY) {
        const rect = canvasBodyRef.current?.getBoundingClientRect();
        if (!rect) {
            return { x: clientX, y: clientY };
        }

        return {
            x: (clientX - rect.left - viewport.x) / viewport.zoom,
            y: (clientY - rect.top - viewport.y) / viewport.zoom,
        };
    }

    const getRenderedNodePosition = useCallback((node) => {
        const dragPreview = dragPreviewPositions?.[node.id] ?? null;

        return {
            x: dragPreview?.x ?? node.position.x,
            y: dragPreview?.y ?? node.position.y,
        };
    }, [dragPreviewPositions]);

    const getOutputPortPosition = useCallback((node) => {
        const position = getRenderedNodePosition(node);
        return {
            x: position.x + 120,
            y: position.y + 56,
        };
    }, [getRenderedNodePosition]);

    const getInputPortPosition = useCallback((node, inputName) => {
        const inputs = getVisibleInputs(node);
        const index = Math.max(0, inputs.indexOf(inputName));
        const position = getRenderedNodePosition(node);

        return {
            x: position.x + 17,
            y: position.y + 61 + index * 20,
        };
    }, [getRenderedNodePosition]);

    const graphEdges = useMemo(() => {
        const nodePositions = new Map(nodes.map((node) => [node.id, node]));

        return edges.map((edge) => ({
            ...edge,
            sourcePosition: nodePositions.get(edge.from)
                ? getOutputPortPosition(nodePositions.get(edge.from))
                : { x: 0, y: 0 },
            targetPosition: nodePositions.get(edge.to)
                ? getInputPortPosition(nodePositions.get(edge.to), edge.input)
                : { x: 100, y: 100 },
        }));
    }, [edges, getInputPortPosition, getOutputPortPosition, nodes]);

    const snappedConnectionTarget = useMemo(() => {
        if (!connection || !activeGraph) return null;

        let best = null;
        const snapRadius = 20;
        const maxDistanceSq = snapRadius * snapRadius;

        for (const node of nodes) {
            for (const inputName of getVisibleInputs(node)) {
                if (
                    !canConnect?.({
                        from: connection.fromNodeId,
                        to: node.id,
                        input: inputName,
                    })
                ) {
                    continue;
                }

                const port = getInputPortPosition(node, inputName);
                const dx = port.x - connection.pointerX;
                const dy = port.y - connection.pointerY;
                const distanceSq = dx * dx + dy * dy;

                if (distanceSq > maxDistanceSq) continue;
                if (!best || distanceSq < best.distanceSq) {
                    best = {
                        nodeId: node.id,
                        input: inputName,
                        position: port,
                        distanceSq,
                    };
                }
            }
        }

        return best;
    }, [activeGraph, canConnect, connection, getInputPortPosition, nodes]);

    const previewEdge = useMemo(() => {
        if (!connection?.active) return null;

        const sourceNode = nodes.find(
            (node) => node.id === connection.fromNodeId,
        );

        if (!sourceNode) return null;

        const source = getOutputPortPosition(sourceNode);
        const target = snappedConnectionTarget?.position ?? {
            x: connection.pointerX,
            y: connection.pointerY,
        };

        return {
            sourcePosition: {
                x: source.x,
                y: source.y,
            },
            targetPosition: {
                x: target.x,
                y: target.y,
            },
        };
    }, [connection, getOutputPortPosition, nodes, snappedConnectionTarget]);

    function handleWheel(event) {
        event.preventDefault();
        onEndPan?.();
        onEndConnection?.();
        onCommitNodeDrag?.();
        onDispatchEvent?.(zoomGraphViewport(event.deltaY));
    }

    function handleMouseDown(event) {
        if (event.target !== event.currentTarget) return;
        onClearSelection?.();
        onDispatchEvent?.(startGraphPan({ x: event.clientX, y: event.clientY }));
    }

    function handleMouseMove(event) {
        if (connection?.active) {
            const point = toLocalGraphPoint(event.clientX, event.clientY);
            onDispatchEvent?.(updateGraphConnection({ pointerX: point.x, pointerY: point.y }));
            return;
        }

        if (drag?.active) {
            onDispatchEvent?.(updateGraphDrag(toLocalGraphPoint(event.clientX, event.clientY)));
            return;
        }

        if (graph?.pan?.active) {
            onDispatchEvent?.(updateGraphPan({ x: event.clientX, y: event.clientY }));
        }
    }

    function handleMouseUp() {
        if (connection?.active && snappedConnectionTarget) {
            onCommitConnection?.({
                from: connection.fromNodeId,
                to: snappedConnectionTarget.nodeId,
                input: snappedConnectionTarget.input,
            });
        }

        onEndConnection?.();
        onEndPan?.();
        onCommitNodeDrag?.();
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
                    {activeGraph?.id ?? activeGraphId ?? 'No active graph'}
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
                        padding: 24,
                        textAlign: 'center',
                    }}>
                    Use the node library to add graph nodes to the active animation graph.
                </div>
            ) : (
                <div
                    ref={canvasBodyRef}
                    style={{ position: 'relative', width: '100%', height: 'calc(100% - 49px)' }}>
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
                                <GraphEdgeView
                                    key={edge.id}
                                    edge={edge}
                                    stroke='rgba(148, 163, 184, 0.6)'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDisconnectEdge?.(edge);
                                    }}
                                />
                            ))}
                            {previewEdge ? (
                                <GraphEdgeView edge={previewEdge} stroke='#60a5fa' dashed />
                            ) : null}
                        </svg>
                        <div style={{ position: 'absolute', inset: 0 }}>
                            {nodes.map((node) => (
                                <GraphNodeView
                                    key={node.id}
                                    node={node}
                                    isSelected={selectionIds.includes(node.id)}
                                    activeConnection={connection?.active ? connection : null}
                                    dragPreviewPosition={dragPreviewPositions?.[node.id] ?? null}
                                    canConnect={canConnect}
                                    onSelectNode={() => onDispatchEvent?.(selectGraphNode(node.id))}
                                    onStartNodeDrag={(clientX, clientY) => {
                                        onDispatchEvent?.(startGraphDrag({
                                            nodeId: node.id,
                                            origin: node.position,
                                            pointer: toLocalGraphPoint(clientX, clientY),
                                        }));
                                    }}
                                    onStartConnection={(nodeId, clientX, clientY) => {
                                        const point = toLocalGraphPoint(clientX, clientY);
                                        onDispatchEvent?.(startGraphConnection({
                                            fromNodeId: nodeId,
                                            pointerX: point.x,
                                            pointerY: point.y,
                                        }));
                                    }}
                                    onCommitConnection={onCommitConnection}
                                    onEndConnection={onEndConnection}
                                    onCommitNodeDrag={onCommitNodeDrag}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
