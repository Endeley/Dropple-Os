'use client';

import { useMemo } from 'react';

const DEFAULT_SIZE = { width: 180, height: 140 };
const ORIGIN = { x: 0, y: 0 };

export function Minimap({ nodes = [], camera, viewportBounds, size = DEFAULT_SIZE }) {
    const bounds = useMemo(() => computeWorldBounds(nodes, ORIGIN), [nodes]);
    const minimapCamera = useMemo(
        () => computeMinimapCamera(bounds, size),
        [bounds, size]
    );

    const nodeRects = useMemo(
        () => nodes.map((node) => mapNode(node, minimapCamera, size)),
        [nodes, minimapCamera, size]
    );

    const originPoint = mapPoint(ORIGIN, minimapCamera, size);
    const viewportRect = viewportBounds
        ? mapWorldRect(viewportBounds, minimapCamera, size)
        : null;

    return (
        <div
            aria-hidden
            style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                width: size.width,
                height: size.height,
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(226,232,240,0.2)',
                borderRadius: 8,
                padding: 6,
                boxSizing: 'border-box',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(2, 6, 23, 0.6)',
                    borderRadius: 6,
                    overflow: 'hidden',
                }}
            >
                {nodeRects.map((rect) => (
                    <div
                        key={rect.id}
                        style={{
                            position: 'absolute',
                            left: rect.x,
                            top: rect.y,
                            width: rect.width,
                            height: rect.height,
                            background: 'rgba(148, 163, 184, 0.5)',
                        }}
                    />
                ))}
                {viewportRect && (
                    <div
                        style={{
                            position: 'absolute',
                            left: viewportRect.x,
                            top: viewportRect.y,
                            width: viewportRect.width,
                            height: viewportRect.height,
                            border: '1px solid rgba(56, 189, 248, 0.95)',
                            boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.2)',
                        }}
                    />
                )}
                <div
                    style={{
                        position: 'absolute',
                        left: originPoint.x - 2,
                        top: originPoint.y - 2,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'rgba(248, 250, 252, 0.9)',
                    }}
                />
            </div>
        </div>
    );
}

function computeWorldBounds(nodes, origin) {
    let minX = origin.x;
    let minY = origin.y;
    let maxX = origin.x;
    let maxY = origin.y;

    nodes.forEach((node) => {
        if (!node) return;
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const w = node.width ?? 0;
        const h = node.height ?? 0;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    });

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const padding = Math.max(width, height) * 0.1;

    return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
        width: width + padding * 2,
        height: height + padding * 2,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
    };
}

function computeMinimapCamera(bounds, viewport) {
    const scaleX = viewport.width / bounds.width;
    const scaleY = viewport.height / bounds.height;
    const scale = Math.min(scaleX, scaleY);

    return {
        x: bounds.centerX,
        y: bounds.centerY,
        scale,
    };
}

function mapPoint(point, camera, viewport) {
    return {
        x: (point.x - camera.x) * camera.scale + viewport.width / 2,
        y: (point.y - camera.y) * camera.scale + viewport.height / 2,
    };
}

function mapWorldRect(rect, camera, viewport) {
    const topLeft = mapPoint({ x: rect.minX, y: rect.minY }, camera, viewport);
    const bottomRight = mapPoint({ x: rect.maxX, y: rect.maxY }, camera, viewport);
    return {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
    };
}

function mapNode(node, camera, viewport) {
    const topLeft = mapPoint({ x: node.x ?? 0, y: node.y ?? 0 }, camera, viewport);
    return {
        id: node.id,
        x: topLeft.x,
        y: topLeft.y,
        width: (node.width ?? 0) * camera.scale,
        height: (node.height ?? 0) * camera.scale,
    };
}
