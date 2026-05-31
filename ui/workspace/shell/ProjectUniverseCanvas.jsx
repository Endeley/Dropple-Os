'use client';

import { useEffect, useMemo, useState } from 'react';
import { resolveSemanticZoomPresentation } from '@/runtime/canvas/zoomTiers.js';

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;

const ARTIFACT_NODES = Object.freeze([
    Object.freeze({ id: 'brand', label: 'Brand System', x: -240, y: -120 }),
    Object.freeze({ id: 'ui', label: 'UI Design', x: 220, y: -110 }),
    Object.freeze({ id: 'app', label: 'App Architecture', x: 260, y: 120 }),
    Object.freeze({ id: 'workflow', label: 'Workflow Maps', x: -220, y: 130 }),
    Object.freeze({ id: 'knowledge', label: 'Knowledge', x: -40, y: 230 }),
    Object.freeze({ id: 'media', label: 'Media Assets', x: 40, y: -230 }),
]);

function resolveTierVisibility(tier) {
    if (tier === 'far') {
        return Object.freeze({
            showProjectHubLabel: true,
            showNodeLabels: false,
            showNodeCards: false,
            showClusterDots: true,
        });
    }
    if (tier === 'overview') {
        return Object.freeze({
            showProjectHubLabel: true,
            showNodeLabels: true,
            showNodeCards: false,
            showClusterDots: true,
        });
    }
    if (tier === 'normal') {
        return Object.freeze({
            showProjectHubLabel: true,
            showNodeLabels: true,
            showNodeCards: true,
            showClusterDots: false,
        });
    }
    return Object.freeze({
        showProjectHubLabel: true,
        showNodeLabels: true,
        showNodeCards: true,
        showClusterDots: false,
    });
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function ProjectUniverseCanvas({
    perspectiveId = 'overview',
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
    const visibility = useMemo(() => resolveTierVisibility(presentation.tier), [presentation.tier]);
    const minimap = useMemo(() => {
        const worldSpan = 640;
        const miniSize = 86;
        const worldToMini = miniSize / worldSpan;
        const centerX = miniSize / 2 + camera.x * worldToMini;
        const centerY = miniSize / 2 + camera.y * worldToMini;
        const viewportSize = clamp(34 / Math.max(camera.scale, 0.01), 8, 40);
        return Object.freeze({
            miniSize,
            centerX: clamp(centerX, 0, miniSize),
            centerY: clamp(centerY, 0, miniSize),
            viewportSize,
        });
    }, [camera.x, camera.y, camera.scale]);

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
                scale: 0.72,
            }),
        );
    };

    const moveCameraFromMinimapPointer = (event) => {
        const element = event.currentTarget;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const miniX = clamp(event.clientX - rect.left, 0, minimap.miniSize);
        const miniY = clamp(event.clientY - rect.top, 0, minimap.miniSize);
        const worldSpan = 640;
        const worldToMini = minimap.miniSize / worldSpan;
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
                        zoom {Math.round(camera.scale * 100)}% · tier {presentation.tier} · {presentation.domain}
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
                        {visibility.showProjectHubLabel ? 'Project Hub' : 'Hub'}
                    </div>
                    {visibility.showClusterDots
                        ? ARTIFACT_NODES.map((node) => (
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
                    {ARTIFACT_NODES.map((node) => (
                        <div
                            key={node.id}
                            style={{
                                position: 'absolute',
                                left: node.x,
                                top: node.y,
                                width: visibility.showNodeCards ? 116 : 108,
                                minHeight: 26,
                                padding: visibility.showNodeCards ? '6px 8px' : '5px 7px',
                                borderRadius: 8,
                                background: visibility.showNodeCards ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)',
                                border: `1px solid ${visibility.showNodeCards ? '#cbd5e1' : '#dbe4ee'}`,
                                fontSize: 11,
                                color: '#0f172a',
                                textAlign: 'center',
                                display: visibility.showNodeCards || visibility.showNodeLabels ? 'block' : 'none',
                            }}>
                            {visibility.showNodeLabels ? node.label : node.id}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
