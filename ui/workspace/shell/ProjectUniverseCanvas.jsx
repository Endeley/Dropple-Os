'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    resolveSemanticZoomNodeSelection,
    resolveSemanticZoomPresentation,
    resolveSemanticZoomVisibility,
} from '@/runtime/canvas/zoomTiers.js';

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function resolveUniverseNodes(universe) {
    const nodes = universe?.nodes && typeof universe.nodes === 'object' ? Object.values(universe.nodes) : [];
    return nodes.filter(Boolean);
}

function resolveUniverseGroups(universe) {
    const groups = universe?.groups && typeof universe.groups === 'object' ? Object.values(universe.groups) : [];
    return groups.filter(Boolean);
}

function resolveBounds(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
        return Object.freeze({
            minX: -320,
            maxX: 320,
            minY: -260,
            maxY: 260,
            spanX: 640,
            spanY: 520,
            span: 640,
        });
    }

    const xs = nodes.map((node) => Number.isFinite(node?.x) ? Number(node.x) : 0);
    const ys = nodes.map((node) => Number.isFinite(node?.y) ? Number(node.y) : 0);
    const minX = Math.min(...xs, -52);
    const maxX = Math.max(...xs, 52);
    const minY = Math.min(...ys, -20);
    const maxY = Math.max(...ys, 20);
    const spanX = Math.max(maxX - minX + 180, 320);
    const spanY = Math.max(maxY - minY + 180, 320);
    return Object.freeze({
        minX,
        maxX,
        minY,
        maxY,
        spanX,
        spanY,
        span: Math.max(spanX, spanY),
    });
}

function formatNodeKind(kind) {
    if (typeof kind !== 'string' || kind.length === 0) return 'artifact';
    return kind
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');
}

function summarizeNodeMetadata(node) {
    const metadata = node?.metadata && typeof node.metadata === 'object' ? node.metadata : null;
    if (!metadata) return 'Projection';

    const sourceId = typeof metadata.sourceId === 'string' && metadata.sourceId.trim().length > 0 ? metadata.sourceId : null;
    if (sourceId) return sourceId;
    const documentId =
        typeof metadata.documentId === 'string' && metadata.documentId.trim().length > 0 ? metadata.documentId : null;
    if (documentId) return documentId;
    const blueprintId =
        typeof metadata.blueprintId === 'string' && metadata.blueprintId.trim().length > 0 ? metadata.blueprintId : null;
    if (blueprintId) return blueprintId;

    const count = Object.keys(metadata).length;
    if (count > 0) {
        return `${count} signal${count === 1 ? '' : 's'}`;
    }

    return 'Projection';
}

function resolveGroupPreviewLabels(group, visibleNodeById) {
    if (!group || !Array.isArray(group.nodeIds)) return [];
    return group.nodeIds
        .map((nodeId) => visibleNodeById.get(nodeId)?.label)
        .filter((label) => typeof label === 'string' && label.trim().length > 0)
        .slice(0, 2);
}

export function ProjectUniverseCanvas({
    perspectiveId = 'overview',
    universe = null,
    initialCamera = null,
    onCameraChange = null,
}) {
    const [camera, setCamera] = useState(() =>
        Object.freeze({
            x: Number.isFinite(initialCamera?.x) ? initialCamera.x : 0,
            y: Number.isFinite(initialCamera?.y) ? initialCamera.y : 0,
            scale: Number.isFinite(initialCamera?.scale) ? clamp(initialCamera.scale, MIN_SCALE, MAX_SCALE) : 1,
        }),
    );
    const [dragState, setDragState] = useState(null);

    const presentation = useMemo(
        () => resolveSemanticZoomPresentation({ scale: camera.scale, perspectiveId }),
        [camera.scale, perspectiveId],
    );
    const visibility = useMemo(() => resolveSemanticZoomVisibility(presentation.tier), [presentation.tier]);
    const artifactNodes = useMemo(() => resolveUniverseNodes(universe), [universe]);
    const artifactGroups = useMemo(() => resolveUniverseGroups(universe), [universe]);
    const nodeSelection = useMemo(
        () =>
            resolveSemanticZoomNodeSelection({
                tier: presentation.tier,
                perspectiveId: presentation.perspectiveId,
                nodeIds: artifactNodes.map((node) => node.id),
            }),
        [artifactNodes, presentation.tier, presentation.perspectiveId],
    );
    const visibleNodes = useMemo(() => {
        const selected = new Set(nodeSelection.selectedNodeIds);
        return artifactNodes.filter((node) => selected.has(node.id));
    }, [artifactNodes, nodeSelection.selectedNodeIds]);
    const renderNodes = useMemo(
        () => visibleNodes.filter((node) => node.id !== universe?.hubId),
        [universe?.hubId, visibleNodes],
    );
    const visibleGroups = useMemo(() => {
        if (presentation.groupDetailLevel === 'domain-chip') {
            return artifactGroups;
        }

        if (presentation.groupDetailLevel === 'artifact-group') {
            const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
            return artifactGroups.filter((group) => group.nodeIds.some((nodeId) => visibleNodeIds.has(nodeId)));
        }

        return [];
    }, [artifactGroups, presentation.groupDetailLevel, visibleNodes]);
    const visibleNodeById = useMemo(
        () => new Map(visibleNodes.map((node) => [node.id, node])),
        [visibleNodes],
    );
    const bounds = useMemo(() => resolveBounds(artifactNodes), [artifactNodes]);
    const minimap = useMemo(() => {
        const miniSize = 86;
        const worldToMini = miniSize / bounds.span;
        const centerX = miniSize / 2 + camera.x * worldToMini;
        const centerY = miniSize / 2 + camera.y * worldToMini;
        const viewportSize = clamp(34 / Math.max(camera.scale, 0.01), 8, 40);
        return Object.freeze({
            miniSize,
            centerX: clamp(centerX, 0, miniSize),
            centerY: clamp(centerY, 0, miniSize),
            viewportSize,
        });
    }, [bounds.span, camera.x, camera.y, camera.scale]);

    useEffect(() => {
        if (typeof onCameraChange === 'function') {
            onCameraChange(camera);
        }
    }, [camera, onCameraChange]);

    useEffect(() => {
        if (!initialCamera) return;
        const next = Object.freeze({
            x: Number.isFinite(initialCamera?.x) ? initialCamera.x : 0,
            y: Number.isFinite(initialCamera?.y) ? initialCamera.y : 0,
            scale: Number.isFinite(initialCamera?.scale) ? clamp(initialCamera.scale, MIN_SCALE, MAX_SCALE) : 1,
        });
        setCamera((current) => {
            if (current.x === next.x && current.y === next.y && current.scale === next.scale) {
                return current;
            }
            return next;
        });
    }, [initialCamera]);

    const onWheel = (event) => {
        event.preventDefault();
        setCamera((current) =>
            Object.freeze({
                ...current,
                scale: clamp(current.scale - event.deltaY * 0.0015, MIN_SCALE, MAX_SCALE),
            }),
        );
    };

    const centerView = () => {
        setCamera((current) =>
            Object.freeze({
                ...current,
                x: 0,
                y: 0,
            }),
        );
    };

    const resetZoom = () => {
        setCamera((current) =>
            Object.freeze({
                ...current,
                scale: 1,
            }),
        );
    };

    const fitView = () => {
        setCamera(() =>
            Object.freeze({
                x: 0,
                y: 0,
                scale: clamp(440 / Math.max(bounds.span, 440), MIN_SCALE, MAX_SCALE),
            }),
        );
    };

    const moveCameraFromMinimapPointer = (event) => {
        const element = event.currentTarget;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const miniX = clamp(event.clientX - rect.left, 0, minimap.miniSize);
        const miniY = clamp(event.clientY - rect.top, 0, minimap.miniSize);
        const worldToMini = minimap.miniSize / bounds.span;
        const x = (miniX - minimap.miniSize / 2) / worldToMini;
        const y = (miniY - minimap.miniSize / 2) / worldToMini;
        setCamera((current) =>
            Object.freeze({
                ...current,
                x,
                y,
            }),
        );
    };

    const onPointerDown = (event) => {
        setDragState(
            Object.freeze({
                originX: event.clientX,
                originY: event.clientY,
                startX: camera.x,
                startY: camera.y,
            }),
        );
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
        if (!dragState) return;
        setCamera((current) =>
            Object.freeze({
                ...current,
                x: dragState.startX + (event.clientX - dragState.originX),
                y: dragState.startY + (event.clientY - dragState.originY),
            }),
        );
    };

    const onPointerUp = (event) => {
        setDragState(null);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
    };

    const hubLabel =
        universe?.hubId && universe?.nodes?.[universe.hubId]?.label
            ? universe.nodes[universe.hubId].label
            : 'Project Hub';

    return (
        <section
            aria-label='Project Universe'
            style={{
                border: '1px solid #d9dee6',
                borderRadius: 10,
                background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
                overflow: 'hidden',
                minHeight: 260,
                position: 'relative',
            }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderBottom: '1px solid #d9dee6',
                    padding: '8px 10px',
                    fontSize: 12,
                    color: '#334155',
                    background: 'rgba(255,255,255,0.85)',
                }}>
                <strong style={{ fontSize: 12 }}>Project Hub</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                        type='button'
                        onClick={fitView}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: 11,
                            padding: '2px 8px',
                            cursor: 'pointer',
                        }}>
                        Fit
                    </button>
                    <button
                        type='button'
                        onClick={centerView}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: 11,
                            padding: '2px 8px',
                            cursor: 'pointer',
                        }}>
                        Center
                    </button>
                    <button
                        type='button'
                        onClick={resetZoom}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: 11,
                            padding: '2px 8px',
                            cursor: 'pointer',
                        }}>
                        Reset
                    </button>
                    <span>
                        {artifactNodes.length} artifacts · zoom {Math.round(camera.scale * 100)}% · tier {presentation.tier} · {presentation.focus} · {presentation.nodeDetailLevel}
                    </span>
                </div>
            </div>
            <div
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{
                    height: 220,
                    cursor: dragState ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    position: 'relative',
                }}>
                <aside
                    aria-label='Project universe mini-map'
                    style={{
                        position: 'absolute',
                        right: 10,
                        bottom: 10,
                        zIndex: 5,
                        width: minimap.miniSize + 10,
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.9)',
                        padding: 5,
                    }}>
                    <div
                        onPointerDown={(event) => {
                            event.currentTarget.setPointerCapture?.(event.pointerId);
                            moveCameraFromMinimapPointer(event);
                        }}
                        onPointerMove={(event) => {
                            if ((event.buttons & 1) !== 1) return;
                            moveCameraFromMinimapPointer(event);
                        }}
                        onPointerUp={(event) => {
                            event.currentTarget.releasePointerCapture?.(event.pointerId);
                        }}
                        style={{
                            position: 'relative',
                            width: minimap.miniSize,
                            height: minimap.miniSize,
                            border: '1px solid #dbe4ee',
                            borderRadius: 6,
                            background: '#f8fafc',
                            overflow: 'hidden',
                            cursor: 'crosshair',
                            touchAction: 'none',
                        }}>
                        <div
                            style={{
                                position: 'absolute',
                                left: minimap.miniSize / 2 - 3,
                                top: minimap.miniSize / 2 - 3,
                                width: 6,
                                height: 6,
                                borderRadius: 999,
                                background: '#0f172a',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                left: minimap.centerX - minimap.viewportSize / 2,
                                top: minimap.centerY - minimap.viewportSize / 2,
                                width: minimap.viewportSize,
                                height: minimap.viewportSize,
                                borderRadius: 3,
                                border: '1px solid #0f172a',
                                background: 'rgba(148,163,184,0.14)',
                            }}
                        />
                    </div>
                </aside>
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
                        transformOrigin: 'center',
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            left: -52,
                            top: -20,
                            width: 104,
                            height: 40,
                            borderRadius: 999,
                            background: '#0f172a',
                            color: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                        }}>
                        {visibility.showProjectHubLabel ? hubLabel : 'Hub'}
                    </div>
                    {visibility.showGroupHalos
                        ? visibleGroups.map((group) => (
                              <div
                                  key={`halo-${group.id}`}
                                  style={{
                                      position: 'absolute',
                                      left: group.x - 28,
                                      top: group.y - 18,
                                      width: presentation.groupDetailLevel === 'domain-chip' ? 170 : 210,
                                      height: presentation.groupDetailLevel === 'domain-chip' ? 68 : 96,
                                      borderRadius: 999,
                                      background:
                                          group.perspectiveId === 'create'
                                              ? 'radial-gradient(circle, rgba(34,197,94,0.16) 0%, rgba(34,197,94,0) 72%)'
                                              : group.perspectiveId === 'build'
                                                ? 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0) 72%)'
                                                : group.perspectiveId === 'operate'
                                                  ? 'radial-gradient(circle, rgba(249,115,22,0.16) 0%, rgba(249,115,22,0) 72%)'
                                                  : group.perspectiveId === 'collaborate'
                                                    ? 'radial-gradient(circle, rgba(168,85,247,0.16) 0%, rgba(168,85,247,0) 72%)'
                                                    : 'radial-gradient(circle, rgba(15,23,42,0.14) 0%, rgba(15,23,42,0) 72%)',
                                      pointerEvents: 'none',
                                  }}
                              />
                          ))
                        : null}
                    {visibility.showClusterDots
                        ? renderNodes.map((node) => (
                              <div
                                  key={`cluster-${node.id}`}
                                  style={{
                                      position: 'absolute',
                                      left: node.x + 54,
                                      top: node.y + 14,
                                      width: 10,
                                      height: 10,
                                      borderRadius: 999,
                                      background: '#334155',
                                  }}
                              />
                          ))
                        : null}
                    {visibility.showGroups ? visibleGroups.map((group) => {
                        const previewLabels = resolveGroupPreviewLabels(group, visibleNodeById);
                        return (
                        <div
                            key={group.id}
                            data-testid={`project-universe-group-${group.perspectiveId}`}
                            style={{
                                position: 'absolute',
                                left: group.x,
                                top: group.y,
                                minWidth: presentation.groupDetailLevel === 'domain-chip' ? 112 : 148,
                                minHeight: presentation.groupDetailLevel === 'domain-chip' ? 30 : 64,
                                padding: presentation.groupDetailLevel === 'domain-chip' ? '7px 12px' : '10px 12px',
                                borderRadius: presentation.groupDetailLevel === 'domain-chip' ? 999 : 16,
                                background:
                                    presentation.groupDetailLevel === 'domain-chip'
                                        ? 'rgba(15,23,42,0.9)'
                                        : 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.94) 100%)',
                                color:
                                    presentation.groupDetailLevel === 'domain-chip'
                                        ? '#f8fafc'
                                        : '#0f172a',
                                border:
                                    presentation.groupDetailLevel === 'domain-chip'
                                        ? '1px solid rgba(15,23,42,0.95)'
                                        : '1px solid #cbd5e1',
                                fontSize: presentation.groupDetailLevel === 'domain-chip' ? 11 : 12,
                                textAlign: 'center',
                                boxShadow:
                                    presentation.groupDetailLevel === 'domain-chip'
                                        ? 'none'
                                        : '0 6px 18px rgba(148,163,184,0.16)',
                            }}>
                            <div style={{ fontWeight: 700 }}>{group.label}</div>
                            {visibility.showGroupCounts ? (
                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                                    {group.nodeIds.length} artifact{group.nodeIds.length === 1 ? '' : 's'}
                                </div>
                            ) : null}
                            {visibility.showGroupPreviews && previewLabels.length > 0 ? (
                                <div
                                    style={{
                                        marginTop: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 4,
                                        flexWrap: 'wrap',
                                    }}>
                                    {previewLabels.map((label) => (
                                        <span
                                            key={`${group.id}-${label}`}
                                            style={{
                                                borderRadius: 999,
                                                background: 'rgba(148,163,184,0.18)',
                                                color: '#334155',
                                                fontSize: 9,
                                                padding: '2px 6px',
                                            }}>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}) : null}
                    {visibility.showNodeLabels || visibility.showNodeCards
                        ? renderNodes.map((node) => (
                        <div
                            key={node.id}
                            data-testid={`project-universe-node-${node.id}`}
                            style={{
                                position: 'absolute',
                                left: node.x,
                                top: node.y,
                                width: visibility.showNodeCards ? 116 : 96,
                                minHeight: 26,
                                padding: visibility.showNodeCards ? '6px 8px' : '5px 7px',
                                borderRadius: visibility.showNodeCards ? 8 : 999,
                                background: visibility.showNodeCards ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.78)',
                                border: `1px solid ${visibility.showNodeCards ? '#cbd5e1' : '#dbe4ee'}`,
                                fontSize: visibility.showNodeCards ? 11 : 10,
                                color: '#0f172a',
                                textAlign: 'center',
                                boxShadow: visibility.showNodeCards ? '0 6px 18px rgba(148,163,184,0.14)' : 'none',
                            }}>
                            {visibility.showNodeLabels ? (
                                <>
                                    <div>{node.label}</div>
                                    {visibility.showNodeKindBadges ? (
                                        <div style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>
                                            {formatNodeKind(node.kind)}
                                        </div>
                                    ) : null}
                                    {visibility.showNodeMetadata ? (
                                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                                            {summarizeNodeMetadata(node)}
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                node.id
                            )}
                        </div>
                    )) : null}
                    {visibility.showClusterDots && nodeSelection.hiddenCount > 0 ? (
                        <div
                            style={{
                                position: 'absolute',
                                left: 132,
                                top: -8,
                                minWidth: 22,
                                height: 18,
                                borderRadius: 999,
                                background: '#0f172a',
                                color: '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                padding: '0 6px',
                            }}>
                            +{nodeSelection.hiddenCount}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
