import { computeSelectionBounds } from './selectionBounds';
import { computeSnapCandidates, resolveSnapDelta, buildSnapGuides } from './snapEngine';

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
    const guides = [];

    const bounds = computeSelectionBounds(nodes);

    const moved = {
        minX: bounds.minX + delta.x,
        minY: bounds.minY + delta.y,
        maxX: bounds.maxX + delta.x,
        maxY: bounds.maxY + delta.y,
    };

    const snapRadius = options.snapRadius ?? 0;
    let blendedDelta = { ...delta };

    if (snapRadius > 0) {
        const movingBounds = {
            x: bounds.minX + delta.x,
            y: bounds.minY + delta.y,
            width: bounds.width,
            height: bounds.height,
        };

        const targets = Array.isArray(options.snapTargets) ? options.snapTargets : siblings;
        const filteredTargets = targets.filter((node) => !nodes.find((m) => m.id === node.id));

        const candidates = computeSnapCandidates({
            movingBounds,
            targets: filteredTargets,
            snapRadius,
        });

        const { delta: snapDelta, primaryX, primaryY } = resolveSnapDelta({ candidates });

        if (primaryX || primaryY) {
            blendedDelta = {
                x: delta.x + snapDelta.x,
                y: delta.y + snapDelta.y,
            };
            guides.push(...buildSnapGuides({ primaryX, primaryY }));
        }
    }

    return {
        delta: blendedDelta,
        guides,
    };
}
