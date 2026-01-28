'use client';

import { useMemo } from 'react';
import { useWorkspaceState } from '@/runtime/state/useWorkspaceState.js';
import { projectToViewport } from '@/canvas/transform/projectToViewport.js';
import { useCanvasContext } from '@/ui/canvas/CanvasContext.jsx';
import { UX_RULES } from '@/ui/canvas/validation/uxRules.js';
import { useValidationIssues } from '@/ui/canvas/validation/useValidationIssues.js';

const COLORS = {
    error: 'rgba(239, 68, 68, 0.9)',
    warning: 'rgba(249, 115, 22, 0.9)',
    info: 'rgba(59, 130, 246, 0.9)',
    spacing: 'rgba(139, 92, 246, 0.9)',
};

const ZOOM_ELIGIBLE = new Set(['normal', 'detail', 'micro']);

export function ValidationOverlayLayer({ nodesById, canvasSize }) {
    const issues = useValidationIssues();
    const viewport = useWorkspaceState((state) => state.viewport);
    const { zoomTier } = useCanvasContext();

    const overlays = useMemo(() => {
        if (!viewport || !issues?.length) return { world: [], screen: [] };

        const world = [];
        const screen = [];

        issues.forEach((issue, index) => {
            if (!issue) return;
            const rects = resolveRects(issue, nodesById, viewport);

            switch (issue.ruleId) {
                case UX_RULES.OVERLAP:
                    rects.forEach((rect, rectIndex) => {
                        world.push(
                            <div
                                key={`overlap-${index}-${rectIndex}`}
                                style={outlineStyle(rect, COLORS.error)}
                            />
                        );
                    });
                    break;
                case UX_RULES.TOO_CLOSE:
                    if (!ZOOM_ELIGIBLE.has(zoomTier)) break;
                    rects.forEach((rect, rectIndex) => {
                        world.push(
                            <div
                                key={`too-close-${index}-${rectIndex}`}
                                style={dashedStyle(rect, COLORS.warning)}
                            />
                        );
                    });
                    break;
                case UX_RULES.MISALIGNED:
                    if (!ZOOM_ELIGIBLE.has(zoomTier)) break;
                    const guide = buildAlignmentGuide(rects);
                    if (guide) {
                        world.push(
                            <div
                                key={`misaligned-${index}`}
                                style={guideStyle(guide)}
                            />
                        );
                    }
                    break;
                case UX_RULES.INCONSISTENT_SPACING:
                    if (!ZOOM_ELIGIBLE.has(zoomTier)) break;
                    const region = resolveRegion(issue, viewport);
                    if (region) {
                        world.push(
                            <div
                                key={`spacing-${index}`}
                                style={dashedStyle(region, COLORS.spacing)}
                            />
                        );
                    }
                    break;
                case UX_RULES.OFFSCREEN_CRITICAL:
                    if (!canvasSize?.width || !canvasSize?.height) break;
                    rects.forEach((rect, rectIndex) => {
                        const indicator = buildOffscreenIndicator(rect, canvasSize);
                        if (!indicator) return;
                        screen.push(
                            <div
                                key={`offscreen-${index}-${rectIndex}`}
                                style={indicatorStyle(indicator)}
                            >
                                {indicator.label}
                            </div>
                        );
                    });
                    break;
                default:
                    break;
            }
        });

        return { world, screen };
    }, [issues, nodesById, viewport, zoomTier, canvasSize]);

    if (!overlays.world.length && !overlays.screen.length) return null;

    return (
        <div
            aria-hidden
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
            {overlays.world}
            {overlays.screen}
        </div>
    );
}

function resolveRects(issue, nodesById, viewport) {
    const ids = issue?.affected?.nodeIds || [];
    return ids
        .map((id) => nodesById?.[id])
        .filter(Boolean)
        .map((node) => toScreenRect(node, viewport));
}

function resolveRegion(issue, viewport) {
    const region = issue?.affected?.region;
    if (!region) return null;
    const topLeft = projectToViewport({ x: region.minX, y: region.minY }, viewport);
    const bottomRight = projectToViewport(
        { x: region.maxX, y: region.maxY },
        viewport
    );
    return {
        x: topLeft.x,
        y: topLeft.y,
        width: Math.max(0, bottomRight.x - topLeft.x),
        height: Math.max(0, bottomRight.y - topLeft.y),
    };
}

function toScreenRect(node, viewport) {
    const position = projectToViewport(node, viewport);
    const scale = viewport?.scale ?? 1;
    return {
        x: position?.x ?? node.x ?? 0,
        y: position?.y ?? node.y ?? 0,
        width: (node.width ?? 0) * scale,
        height: (node.height ?? 0) * scale,
    };
}

function outlineStyle(rect, color) {
    return {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `2px solid ${color}`,
        borderRadius: 4,
        boxSizing: 'border-box',
    };
}

function dashedStyle(rect, color) {
    return {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `1px dashed ${color}`,
        borderRadius: 4,
        boxSizing: 'border-box',
    };
}

function buildAlignmentGuide(rects) {
    if (!rects || rects.length < 2) return null;
    const [a, b] = rects;
    const aCenter = {
        x: a.x + a.width / 2,
        y: a.y + a.height / 2,
    };
    const bCenter = {
        x: b.x + b.width / 2,
        y: b.y + b.height / 2,
    };
    const dx = Math.abs(aCenter.x - bCenter.x);
    const dy = Math.abs(aCenter.y - bCenter.y);

    if (dx <= dy) {
        const x = (aCenter.x + bCenter.x) / 2;
        const top = Math.min(aCenter.y, bCenter.y);
        const height = Math.max(1, Math.abs(aCenter.y - bCenter.y));
        return { x, y: top, width: 1, height, color: COLORS.info };
    }

    const y = (aCenter.y + bCenter.y) / 2;
    const left = Math.min(aCenter.x, bCenter.x);
    const width = Math.max(1, Math.abs(aCenter.x - bCenter.x));
    return { x: left, y, width, height: 1, color: COLORS.info };
}

function guideStyle(line) {
    return {
        position: 'absolute',
        left: line.x,
        top: line.y,
        width: line.width,
        height: line.height,
        background: line.color,
        opacity: 0.7,
    };
}

function buildOffscreenIndicator(rect, canvasSize) {
    const width = canvasSize.width ?? 0;
    const height = canvasSize.height ?? 0;
    const leftDistance = rect.x + rect.width;
    const rightDistance = rect.x - width;
    const topDistance = rect.y + rect.height;
    const bottomDistance = rect.y - height;

    const offLeft = leftDistance < 0;
    const offRight = rect.x > width;
    const offTop = topDistance < 0;
    const offBottom = rect.y > height;

    if (!offLeft && !offRight && !offTop && !offBottom) return null;

    const options = [];
    if (offLeft) options.push({ edge: 'left', distance: Math.abs(leftDistance) });
    if (offRight) options.push({ edge: 'right', distance: Math.abs(rightDistance) });
    if (offTop) options.push({ edge: 'top', distance: Math.abs(topDistance) });
    if (offBottom) options.push({ edge: 'bottom', distance: Math.abs(bottomDistance) });

    options.sort((a, b) => b.distance - a.distance);
    const edge = options[0].edge;

    const offset = 12;
    switch (edge) {
        case 'left':
            return {
                x: offset,
                y: clamp(rect.y + rect.height / 2, offset, height - offset),
                label: '<',
                edge,
            };
        case 'right':
            return {
                x: width - offset,
                y: clamp(rect.y + rect.height / 2, offset, height - offset),
                label: '>',
                edge,
            };
        case 'top':
            return {
                x: clamp(rect.x + rect.width / 2, offset, width - offset),
                y: offset,
                label: '^',
                edge,
            };
        case 'bottom':
            return {
                x: clamp(rect.x + rect.width / 2, offset, width - offset),
                y: height - offset,
                label: 'v',
                edge,
            };
        default:
            return null;
    }
}

function indicatorStyle(indicator) {
    return {
        position: 'absolute',
        left: indicator.x,
        top: indicator.y,
        transform: 'translate(-50%, -50%)',
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.warning,
        background: 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${COLORS.warning}`,
        borderRadius: 999,
        width: 18,
        height: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
    };
}

function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
}
