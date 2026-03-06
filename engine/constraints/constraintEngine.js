import { computeSelectionBounds } from '../../domain/geometry/selectionBounds.js';
import { resolveSnap } from './snapEngine.js';

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
        const targets = Array.isArray(options.snapTargets) ? options.snapTargets : siblings;
        const movingIds = new Set(nodes.map((node) => node.id));
        const filteredTargets = targets.filter((node) => !movingIds.has(node.id));

        const pointerWorld = {
            x: bounds.minX + delta.x,
            y: bounds.minY + delta.y,
        };

        const candidates = filteredTargets.map((node) => ({
            nodeId: node.id,
            bounds: {
                x: node.x ?? node.layout?.x ?? 0,
                y: node.y ?? node.layout?.y ?? 0,
                width: node.width ?? node.layout?.width ?? 0,
                height: node.height ?? node.layout?.height ?? 0,
            },
        }));

        const { snappedPoint, guides: snapGuides } = resolveSnap({
            pointerWorld,
            nodeBounds: bounds,
            candidates,
            gridSize: options.gridSize ?? null,
            threshold: snapRadius,
        });

        blendedDelta = {
            x: snappedPoint.x - bounds.minX,
            y: snappedPoint.y - bounds.minY,
        };

        if (snapGuides?.length) {
            guides.push(...snapGuides);
        }
    }

    return {
        delta: blendedDelta,
        guides,
    };
}
