'use client';

import { projectRectToViewport } from '@/canvas/transform/projectRectToViewport.js';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';
import { closestPointOnRect } from '@/ui/canvas/nearest/nearestWorldNodes.js';

export function CanvasNearestDebugOverlay({ viewport, worldPoint, radius, results }) {
    if (!viewport || !worldPoint) return null;

    const cursorScreen = projectToViewport(worldPoint, viewport);
    const radiusPx = radius * viewport.scale;
    const topHit = results?.[0];
    const highlightRect = topHit
        ? projectRectToViewport(
              {
                  x: topHit.bounds.x,
                  y: topHit.bounds.y,
                  width: topHit.bounds.width,
                  height: topHit.bounds.height,
              },
              viewport
          )
        : null;

    const nearestPoint = topHit
        ? closestPointOnRect(worldPoint, topHit.bounds)
        : null;
    const nearestPointScreen = nearestPoint
        ? projectToViewport(nearestPoint, viewport)
        : null;

    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: cursorScreen.x - radiusPx,
                    top: cursorScreen.y - radiusPx,
                    width: radiusPx * 2,
                    height: radiusPx * 2,
                    borderRadius: '50%',
                    border: '1px dashed rgba(59, 130, 246, 0.45)',
                    background: 'rgba(59, 130, 246, 0.04)',
                }}
            />
            {highlightRect && (
                <div
                    style={{
                        position: 'absolute',
                        left: highlightRect.x,
                        top: highlightRect.y,
                        width: highlightRect.width,
                        height: highlightRect.height,
                        border: '1px solid rgba(14, 165, 233, 0.9)',
                        boxShadow: '0 0 0 1px rgba(125, 211, 252, 0.4)',
                    }}
                />
            )}
            {nearestPointScreen && (
                <svg
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <line
                        x1={cursorScreen.x}
                        y1={cursorScreen.y}
                        x2={nearestPointScreen.x}
                        y2={nearestPointScreen.y}
                        stroke="rgba(56, 189, 248, 0.8)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                </svg>
            )}
            {topHit && (
                <div
                    style={{
                        position: 'absolute',
                        left: cursorScreen.x + 10,
                        top: cursorScreen.y + 10,
                        padding: '4px 6px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        color: '#e2e8f0',
                        fontSize: 11,
                        borderRadius: 6,
                        lineHeight: 1.3,
                    }}
                >
                    <div>{topHit.node.id}</div>
                    <div>
                        {topHit.relation} · {topHit.distance.toFixed(1)}
                    </div>
                </div>
            )}
        </div>
    );
}
