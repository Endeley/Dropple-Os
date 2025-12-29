/**
 * Computes derived layout for an auto-layout container.
 * Supports fixed / fill / hug presets.
 */
import { measureText } from '@/engine/measure/measureText';
import { measureChildrenBounds } from '@/engine/measure/measureChildrenBounds';

export function computeAutoLayout(container, children, allNodes = {}) {
    const layout = container.layout;
    if (!layout || layout.mode === 'none') return null;

    const { mode, gap = 0, padding = 0 } = layout;

    const isVertical = mode === 'auto-y';

    // 1️⃣ Measure children (fixed + hug) before fill distribution
    const measured = children.map((child) => resolveChildSize(child, allNodes));

    let fixedTotal = 0;
    let fillCount = 0;

    measured.forEach((entry) => {
        if (entry.preset === 'fill') {
            fillCount += 1;
        } else {
            fixedTotal += isVertical ? entry.height : entry.width;
        }
    });

    const containerSize = isVertical ? container.height ?? 0 : container.width ?? 0;

    const totalGap = Math.max(0, children.length - 1) * gap;

    const available = containerSize - padding * 2 - fixedTotal - totalGap;

    const fillSize = fillCount > 0 ? Math.max(0, available / fillCount) : 0;

    // 2️⃣ Position children
    let cursor = padding;
    const positions = {};

    measured.forEach((entry) => {
        const { child, preset } = entry;

        let { width, height } = entry;

        if (preset === 'fill') {
            if (isVertical) {
                height = fillSize;
            } else {
                width = fillSize;
            }
        }

        const x = isVertical ? padding : cursor;
        const y = isVertical ? cursor : padding;

        positions[child.id] = {
            x,
            y,
            width,
            height,
        };

        cursor += (isVertical ? height : width) + gap;
    });

    return positions;
}

function measureHug(node, allNodes) {
    // Text measurement (deterministic approximation)
    if (node.type === 'text') {
        return measureText(node.text, {
            fontSize: node.fontSize,
            lineHeight: node.lineHeight,
            maxWidth: node.maxWidth,
        });
    }

    // Auto-layout container: bounding box of children + padding
    if (node.layout && node.layout.mode && node.layout.mode !== 'none') {
        const padding = node.layout.padding ?? 0;
        const kids = (node.children || []).map((id) => allNodes[id]).filter(Boolean);
        if (!kids.length) {
            return { width: padding * 2, height: padding * 2 };
        }
        const bounds = measureChildrenBounds(kids);
        return {
            width: Math.max(0, bounds.width + padding * 2),
            height: Math.max(0, bounds.height + padding * 2),
        };
    }

    // Default fallback: use existing size
    return { width: node.width ?? 0, height: node.height ?? 0 };
}

function resolveChildSize(child, allNodes) {
    const preset = child.layoutChild?.size ?? 'fixed';
    if (preset === 'hug') {
        const hug = measureHug(child, allNodes);
        return { child, preset, width: hug.width, height: hug.height };
    }
    return {
        child,
        preset,
        width: child.width ?? 0,
        height: child.height ?? 0,
    };
}
