import { UX_RULES } from './uxRules.js';
import { getSnapRadius } from '../snap/snapConfig.js';

export const UX_THRESHOLDS = {
    OVERLAP_TOLERANCE: 0,
    MIN_SPACING: 10,
    ROW_TOLERANCE: 12,
    GAP_TOLERANCE: 6,
    MAX_NODE_LIST: 20,
};

if (process.env.NODE_ENV === 'development') {
    Object.freeze(UX_THRESHOLDS);
}

export function validateUX({ nodes = [], camera, viewportBounds, zoomTier }) {
    if (!Array.isArray(nodes) || nodes.length === 0) return [];

    const issues = [];
    const nodeRects = nodes.map(toRect);

    const zoomEligible =
        zoomTier === 'normal' || zoomTier === 'detail' || zoomTier === 'micro';

    // 1) Overlap
    for (let i = 0; i < nodeRects.length; i += 1) {
        for (let j = i + 1; j < nodeRects.length; j += 1) {
            const a = nodeRects[i];
            const b = nodeRects[j];
            if (rectOverlap(a, b, UX_THRESHOLDS.OVERLAP_TOLERANCE)) {
                issues.push({
                    id: issueId(UX_RULES.OVERLAP, [a.id, b.id]),
                    ruleId: UX_RULES.OVERLAP,
                    severity: 'error',
                    message: 'These elements overlap.',
                    affected: { nodeIds: [a.id, b.id] },
                    explain:
                        'Overlapping UI elements often cause usability and accessibility issues.',
                });
            }
        }
    }

    // 2) Too close
    for (let i = 0; i < nodeRects.length; i += 1) {
        for (let j = i + 1; j < nodeRects.length; j += 1) {
            const a = nodeRects[i];
            const b = nodeRects[j];
            const distance = rectDistance(a, b);
            if (distance > 0 && distance < UX_THRESHOLDS.MIN_SPACING) {
                issues.push({
                    id: issueId(UX_RULES.TOO_CLOSE, [a.id, b.id]),
                    ruleId: UX_RULES.TOO_CLOSE,
                    severity: 'warning',
                    message: 'These elements are very close.',
                    affected: { nodeIds: [a.id, b.id] },
                    explain:
                        'Insufficient spacing reduces readability and tap accuracy.',
                });
            }
        }
    }

    // 3) Misaligned (within snap radius but not aligned)
    if (zoomEligible) {
        const snapRadius = getSnapRadius(zoomTier ?? camera?.zoomTier);
        if (snapRadius > 0) {
            for (let i = 0; i < nodeRects.length; i += 1) {
                for (let j = i + 1; j < nodeRects.length; j += 1) {
                    const a = nodeRects[i];
                    const b = nodeRects[j];
                    if (isNearlyAligned(a, b, snapRadius)) continue;
                    if (isWithinAlignmentRadius(a, b, snapRadius)) {
                        issues.push({
                            id: issueId(UX_RULES.MISALIGNED, [a.id, b.id]),
                            ruleId: UX_RULES.MISALIGNED,
                            severity: 'info',
                            message: 'These elements are almost aligned.',
                            affected: { nodeIds: [a.id, b.id] },
                            explain:
                                'Elements that are almost aligned can feel visually unintentional.',
                        });
                    }
                }
            }
        }
    }

    // 4) Inconsistent spacing (simple row/column check)
    if (zoomEligible) {
        const rows = groupByRow(nodeRects, UX_THRESHOLDS.ROW_TOLERANCE);
        rows.forEach((row) => {
            if (row.length < 3) return;
            const gaps = computeGaps(row, 'x');
            if (gaps.length >= 2 && gapVariance(gaps) > UX_THRESHOLDS.GAP_TOLERANCE) {
                issues.push({
                    id: issueId(UX_RULES.INCONSISTENT_SPACING, row.map((n) => n.id)),
                    ruleId: UX_RULES.INCONSISTENT_SPACING,
                    severity: 'info',
                    message: 'Spacing in this row is inconsistent.',
                    affected: {
                        nodeIds: row.map((n) => n.id),
                        region: rowBounds(row),
                    },
                    explain:
                        'Inconsistent spacing can make layouts feel uneven.',
                });
            }
        });

        const cols = groupByColumn(nodeRects, UX_THRESHOLDS.ROW_TOLERANCE);
        cols.forEach((col) => {
            if (col.length < 3) return;
            const gaps = computeGaps(col, 'y');
            if (gaps.length >= 2 && gapVariance(gaps) > UX_THRESHOLDS.GAP_TOLERANCE) {
                issues.push({
                    id: issueId(UX_RULES.INCONSISTENT_SPACING, col.map((n) => n.id)),
                    ruleId: UX_RULES.INCONSISTENT_SPACING,
                    severity: 'info',
                    message: 'Spacing in this column is inconsistent.',
                    affected: {
                        nodeIds: col.map((n) => n.id),
                        region: rowBounds(col),
                    },
                    explain:
                        'Inconsistent spacing can make layouts feel uneven.',
                });
            }
        });
    }

    // 5) Offscreen critical (simple: any nodes off viewport)
    if (zoomEligible && viewportBounds) {
        const offscreen = nodeRects.filter((node) => !rectIntersectsBounds(node, viewportBounds));
        if (offscreen.length > 0) {
            issues.push({
                id: issueId(UX_RULES.OFFSCREEN_CRITICAL, offscreen.map((n) => n.id)),
                ruleId: UX_RULES.OFFSCREEN_CRITICAL,
                severity: 'warning',
                message: 'Some elements are outside the viewport.',
                affected: {
                    nodeIds: offscreen
                        .slice(0, UX_THRESHOLDS.MAX_NODE_LIST)
                        .map((n) => n.id),
                },
                explain:
                    'Important elements outside the viewport may be missed by users.',
            });
        }
    }

    return issues;
}

function toRect(node) {
    return {
        id: node.id,
        x: node.x ?? 0,
        y: node.y ?? 0,
        width: node.width ?? 0,
        height: node.height ?? 0,
    };
}

function rectOverlap(a, b, tolerance) {
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    return overlapX > tolerance && overlapY > tolerance;
}

function rectDistance(a, b) {
    const dx = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width), 0);
    const dy = Math.max(b.y - (a.y + a.height), a.y - (b.y + b.height), 0);
    return Math.hypot(dx, dy);
}

function rectIntersectsBounds(rect, bounds) {
    return (
        rect.x <= bounds.maxX &&
        rect.x + rect.width >= bounds.minX &&
        rect.y <= bounds.maxY &&
        rect.y + rect.height >= bounds.minY
    );
}

function rectCenter(rect) {
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    };
}

function isNearlyAligned(a, b, snapRadius) {
    return (
        Math.abs(a.x - b.x) <= 1 ||
        Math.abs(a.x + a.width - (b.x + b.width)) <= 1 ||
        Math.abs(rectCenter(a).x - rectCenter(b).x) <= 1 ||
        Math.abs(a.y - b.y) <= 1 ||
        Math.abs(a.y + a.height - (b.y + b.height)) <= 1 ||
        Math.abs(rectCenter(a).y - rectCenter(b).y) <= 1
    );
}

function isWithinAlignmentRadius(a, b, snapRadius) {
    const checks = [
        Math.abs(a.x - b.x),
        Math.abs(a.x + a.width - (b.x + b.width)),
        Math.abs(a.x - (b.x + b.width)),
        Math.abs(a.x + a.width - b.x),
        Math.abs(rectCenter(a).x - rectCenter(b).x),
        Math.abs(a.y - b.y),
        Math.abs(a.y + a.height - (b.y + b.height)),
        Math.abs(a.y - (b.y + b.height)),
        Math.abs(a.y + a.height - b.y),
        Math.abs(rectCenter(a).y - rectCenter(b).y),
    ];
    return checks.some((delta) => delta > 1 && delta <= snapRadius);
}

function groupByRow(nodes, tolerance) {
    const rows = [];
    const sorted = [...nodes].sort((a, b) => rectCenter(a).y - rectCenter(b).y);
    sorted.forEach((node) => {
        const cy = rectCenter(node).y;
        const row = rows.find((r) => Math.abs(r.center - cy) <= tolerance);
        if (row) {
            row.nodes.push(node);
            row.center = average(row.nodes.map((n) => rectCenter(n).y));
        } else {
            rows.push({ center: cy, nodes: [node] });
        }
    });
    return rows.map((row) => row.nodes.sort((a, b) => a.x - b.x));
}

function groupByColumn(nodes, tolerance) {
    const cols = [];
    const sorted = [...nodes].sort((a, b) => rectCenter(a).x - rectCenter(b).x);
    sorted.forEach((node) => {
        const cx = rectCenter(node).x;
        const col = cols.find((c) => Math.abs(c.center - cx) <= tolerance);
        if (col) {
            col.nodes.push(node);
            col.center = average(col.nodes.map((n) => rectCenter(n).x));
        } else {
            cols.push({ center: cx, nodes: [node] });
        }
    });
    return cols.map((col) => col.nodes.sort((a, b) => a.y - b.y));
}

function computeGaps(nodes, axis) {
    const gaps = [];
    for (let i = 0; i < nodes.length - 1; i += 1) {
        const a = nodes[i];
        const b = nodes[i + 1];
        if (axis === 'x') {
            gaps.push(Math.max(0, b.x - (a.x + a.width)));
        } else {
            gaps.push(Math.max(0, b.y - (a.y + a.height)));
        }
    }
    return gaps;
}

function gapVariance(gaps) {
    if (!gaps.length) return 0;
    const min = Math.min(...gaps);
    const max = Math.max(...gaps);
    return max - min;
}

function rowBounds(nodes) {
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.width));
    const maxY = Math.max(...nodes.map((n) => n.y + n.height));
    return { minX, minY, maxX, maxY };
}

function average(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function issueId(ruleId, nodeIds) {
    const normalized = nodeIds.filter(Boolean).sort().join('|');
    return `${ruleId}:${normalized}`;
}
