import { identityMatrix, multiplyMatrix } from '../math/matrix2d.js';
import { ensureSceneCache } from './sceneCache.js';
import { computeLocalTransform } from './computeLocalTransform.js';
import { computeWorldBounds } from './computeWorldBounds.js';

function evaluateNodeInternal({ nodeId, document, runtime, visiting }) {
    const scene = ensureSceneCache(runtime);
    const computed = scene.computed;
    const nodes = document?.sceneGraph?.nodes ?? {};
    const node = nodes[nodeId];

    if (!node) return null;
    if (visiting.has(nodeId)) {
        throw new Error(`evaluateNode: cycle detected at '${nodeId}'`);
    }

    visiting.add(nodeId);

    let parentEntry = null;
    const parentId = node.parentId ?? null;

    if (parentId) {
        parentEntry =
            computed[parentId] ??
            evaluateNodeInternal({
                nodeId: parentId,
                document,
                runtime,
                visiting,
            });
    }

    const parentTransform = parentEntry?.worldTransform ?? identityMatrix();
    const localTransform = computeLocalTransform(node);
    const worldTransform = multiplyMatrix(parentTransform, localTransform);
    const worldBounds = computeWorldBounds(node, worldTransform);

    const nextEntry = {
        id: node.id,
        parentId,
        worldTransform,
        worldBounds,
        x: worldBounds.x,
        y: worldBounds.y,
        width: worldBounds.width,
        height: worldBounds.height,
        zIndex: node?.zIndex ?? node?.props?.zIndex ?? parentEntry?.zIndex ?? 0,
    };

    computed[nodeId] = nextEntry;
    visiting.delete(nodeId);

    return nextEntry;
}

export function evaluateNode({ nodeId, document, runtime }) {
    return evaluateNodeInternal({
        nodeId,
        document,
        runtime,
        visiting: new Set(),
    });
}
