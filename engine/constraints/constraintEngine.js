import { computeSelectionBounds } from './selectionBounds';
import { findBestSnap } from './snapUtils';

// Pure constraint evaluation helpers.
// No side effects, no global state.

/**
 * @param {Object} input
 * @param {{ x:number, y:number }} input.delta
 * @param {Object[]} input.nodes        // nodes being moved
 * @param {Object[]} input.siblings     // potential snap targets
 * @param {Object} input.canvas         // bounds
 * @param {Object} input.options        // grid size, threshold
 *
 * @returns {{
 *   delta: { x:number, y:number },
 *   guides: Array
 * }}
 */
export function applyMoveConstraints({ delta, nodes, siblings = [], canvas, options = {} }) {
    if (!nodes || nodes.length === 0) {
        return { delta, guides: [] };
    }
    const threshold = options.snapThreshold ?? 6;
    const guides = [];

    const bounds = computeSelectionBounds(nodes);

    const moved = {
        minX: bounds.minX + delta.x,
        minY: bounds.minY + delta.y,
        maxX: bounds.maxX + delta.x,
        maxY: bounds.maxY + delta.y,
    };

    // --- X AXIS CANDIDATES ---
    const xCandidates = [];

    // Canvas
    if (canvas) {
        xCandidates.push(0);
        if (canvas.width != null && canvas.width !== undefined) {
            // snap selection's left edge so right edge aligns to canvas width
            xCandidates.push(canvas.width - bounds.width);
        }
    }

    // Siblings
    siblings.forEach((n) => {
        const x = n?.x ?? 0;
        const w = n?.width ?? 0;
        xCandidates.push(x);
        xCandidates.push(x + w);
    });

    const snapX = findBestSnap(moved.minX, xCandidates, threshold);

    // --- Y AXIS CANDIDATES ---
    const yCandidates = [];

    if (canvas) {
        yCandidates.push(0);
        if (canvas.height != null && canvas.height !== undefined) {
            // snap selection's top edge so bottom edge aligns to canvas height
            yCandidates.push(canvas.height - bounds.height);
        }
    }

    siblings.forEach((n) => {
        const y = n?.y ?? 0;
        const h = n?.height ?? 0;
        yCandidates.push(y);
        yCandidates.push(y + h);
    });

    const snapY = findBestSnap(moved.minY, yCandidates, threshold);

    let blendedDelta = { ...delta };

    if (snapX) {
        blendedDelta.x = snapX.value - bounds.minX;
        guides.push({ id: 'snap-x', type: 'vertical', x: snapX.value });
    }

    if (snapY) {
        blendedDelta.y = snapY.value - bounds.minY;
        guides.push({ id: 'snap-y', type: 'horizontal', y: snapY.value });
    }

    return {
        delta: blendedDelta,
        guides,
    };
}
