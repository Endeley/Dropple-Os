'use client';

import { useMemo, useState } from 'react';
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

export function ProjectUniverseCanvas({ perspectiveId = 'overview' }) {
    const [camera, setCamera] = useState(() => Object.freeze({ x: 0, y: 0, scale: 1 }));
    const [dragState, setDragState] = useState(null);

    const presentation = useMemo(
        () => resolveSemanticZoomPresentation({ scale: camera.scale, perspectiveId }),
        [camera.scale, perspectiveId],
    );
    const visibility = useMemo(() => resolveTierVisibility(presentation.tier), [presentation.tier]);

    const onWheel = (event) => {
        event.preventDefault();
        setCamera((current) =>
            Object.freeze({
                ...current,
                scale: clamp(current.scale - event.deltaY * 0.0015, MIN_SCALE, MAX_SCALE),
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
                <span>
                    zoom {Math.round(camera.scale * 100)}% · tier {presentation.tier} · {presentation.domain}
                </span>
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
