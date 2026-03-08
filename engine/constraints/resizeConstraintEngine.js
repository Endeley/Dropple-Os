import { computeSelectionBounds } from '../../domain/geometry/selectionBounds.js';
import { findBestSnap } from './snapUtils.js';

export function applyResizeConstraints({ pointerDelta, handle, nodes, siblings = [], canvas, options = {} }) {
    if (!nodes || nodes.length === 0) {
        return {
            resize: { width: 0, height: 0 },
            delta: { x: 0, y: 0 },
            guides: [],
        };
    }

    const bounds = computeSelectionBounds(nodes);

    const lockAspectRatio = options.lockAspectRatio;
    const centerResize = options.centerResize;
    const aspectRatio =
        options.aspectRatio ??
        (bounds.height === 0 ? 1 : bounds.width / bounds.height);

    let widthDelta = 0;
    let heightDelta = 0;
    let xDelta = 0;
    let yDelta = 0;

    // Horizontal intent
    if (handle.includes('e')) {
        widthDelta = pointerDelta.x;
    }
    if (handle.includes('w')) {
        widthDelta = -pointerDelta.x;
        xDelta = pointerDelta.x;
    }

    // Vertical intent
    if (handle.includes('s')) {
        heightDelta = pointerDelta.y;
    }
    if (handle.includes('n')) {
        heightDelta = -pointerDelta.y;
        yDelta = pointerDelta.y;
    }

    // 🔐 ASPECT RATIO LOCK
    if (lockAspectRatio) {
        if (Math.abs(widthDelta) > Math.abs(heightDelta)) {
            heightDelta = widthDelta / aspectRatio;
            if (handle.includes('n')) yDelta = -heightDelta;
        } else {
            widthDelta = heightDelta * aspectRatio;
            if (handle.includes('w')) xDelta = -widthDelta;
        }
    }

    if (centerResize) {
        widthDelta *= 2;
        heightDelta *= 2;
        xDelta -= widthDelta / 2;
        yDelta -= heightDelta / 2;
    }

    const minWidth = options.minWidth ?? 1;
    const minHeight = options.minHeight ?? 1;

    let nextWidth = Math.max(minWidth, bounds.width + widthDelta);
    let nextHeight = Math.max(minHeight, bounds.height + heightDelta);

    const guides = [];
    const threshold = options.snapThreshold ?? options.threshold ?? 6;
    const gridSize = options.gridSize;
    const snapTargets = Array.isArray(options.snapTargets) ? options.snapTargets : siblings;

    // SNAP X (active edge only)
    if (handle.includes('e')) {
        const rightEdge = bounds.minX + nextWidth;
        const xCandidates = buildXCandidates(bounds, snapTargets, canvas);
        if (gridSize && gridSize > 0) {
            xCandidates.push(Math.round(rightEdge / gridSize) * gridSize);
        }
        const snap = findBestSnap(rightEdge, xCandidates, threshold);
        if (snap) {
            nextWidth = snap.value - bounds.minX;
            guides.push({ type: 'vertical', x: snap.value, sourceNodeId: null });
        }
    }
    if (handle.includes('w')) {
        const leftEdge = bounds.minX + xDelta;
        const xCandidates = buildXCandidates(bounds, snapTargets, canvas);
        if (gridSize && gridSize > 0) {
            xCandidates.push(Math.round(leftEdge / gridSize) * gridSize);
        }
        const snap = findBestSnap(leftEdge, xCandidates, threshold);
        if (snap) {
            const snappedLeft = snap.value;
            const widthAfterSnap = bounds.maxX - snappedLeft;
            nextWidth = Math.max(minWidth, widthAfterSnap);
            xDelta = snappedLeft - bounds.minX;
            guides.push({ type: 'vertical', x: snap.value, sourceNodeId: null });
        }
    }

    // SNAP Y (active edge only)
    if (handle.includes('s')) {
        const bottomEdge = bounds.maxY + nextHeight - bounds.height;
        const yCandidates = buildYCandidates(bounds, snapTargets, canvas);
        if (gridSize && gridSize > 0) {
            yCandidates.push(Math.round(bottomEdge / gridSize) * gridSize);
        }
        const snap = findBestSnap(bottomEdge, yCandidates, threshold);
        if (snap) {
            nextHeight = snap.value - bounds.minY;
            guides.push({ type: 'horizontal', y: snap.value, sourceNodeId: null });
        }
    }
    if (handle.includes('n')) {
        const topEdge = bounds.minY + yDelta;
        const yCandidates = buildYCandidates(bounds, snapTargets, canvas);
        if (gridSize && gridSize > 0) {
            yCandidates.push(Math.round(topEdge / gridSize) * gridSize);
        }
        const snap = findBestSnap(topEdge, yCandidates, threshold);
        if (snap) {
            const snappedTop = snap.value;
            const heightAfterSnap = bounds.maxY - snappedTop;
            nextHeight = Math.max(minHeight, heightAfterSnap);
            yDelta = snappedTop - bounds.minY;
            guides.push({ type: 'horizontal', y: snap.value, sourceNodeId: null });
        }
    }

    return {
        resize: {
            width: nextWidth - bounds.width,
            height: nextHeight - bounds.height,
        },
        delta: { x: xDelta, y: yDelta },
        guides,
    };
}


function buildXCandidates(bounds, siblings, canvas) {
    const xs = [];
    if (canvas && canvas.width != null) {
        xs.push(0);
        xs.push(canvas.width);
    }
    // candidates represent absolute edges, not deltas
    siblings.forEach((sib) => {
        const x = sib?.x ?? 0;
        const w = sib?.width ?? 0;
        xs.push(x);
        xs.push(x + w);
        xs.push(x + w / 2);
    });
    return xs;
}

function buildYCandidates(bounds, siblings, canvas) {
    const ys = [];
    if (canvas && canvas.height != null) {
        ys.push(0);
        ys.push(canvas.height);
    }
    siblings.forEach((sib) => {
        const y = sib?.y ?? 0;
        const h = sib?.height ?? 0;
        ys.push(y);
        ys.push(y + h);
        ys.push(y + h / 2);
    });
    return ys;
}
