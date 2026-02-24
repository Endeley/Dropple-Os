const HASH_SCHEMA_VERSION = 1;

function stableStringify(obj) {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }

    const keys = Object.keys(obj).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}

function normalizeRenderStateForHash(node) {
    if (node == null) return node;

    if (typeof node === 'number') {
        return Number(node.toFixed(5));
    }

    if (typeof node !== 'object') return node;

    const result = {};

    if (node.id) result.id = node.id;
    if (node.type) result.type = node.type;
    if (node.opacity != null) result.opacity = Number(node.opacity.toFixed(5));
    if (node.visibility != null) result.visibility = node.visibility;

    if (node.transform) {
        result.transform = normalizeRenderStateForHash(node.transform);
    }

    if (node.layout) {
        result.layout = normalizeRenderStateForHash(node.layout);
    }

    if (node.geometry) {
        result.geometry = normalizeRenderStateForHash(node.geometry);
    }

    if (node.style) {
        result.style = normalizeRenderStateForHash(node.style);
    }

    return result;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // force 32-bit
    }
    return hash >>> 0; // unsigned
}

function hashNode(node, childHashes = []) {
    const normalized = normalizeRenderStateForHash(node);
    const stable = stableStringify({
        __hashSchemaVersion: HASH_SCHEMA_VERSION,
        node: normalized,
        children: childHashes,
    });
    return simpleHash(stable).toString(16);
}

function buildNodeIndex(root) {
    const index = new Map();
    const stack = Array.isArray(root) ? [...root] : [root];

    while (stack.length) {
        const current = stack.pop();
        if (!current || typeof current !== 'object') continue;
        if (current.id) {
            index.set(current.id, current);
        }
        if (Array.isArray(current.children)) {
            for (const child of current.children) {
                stack.push(child);
            }
        }
    }

    return index;
}

function shallowNormalizedEquals(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        stableStringify(normalizeRenderStateForHash(a)) ===
        stableStringify(normalizeRenderStateForHash(b))
    );
}

function attachHashes(node, { previousIndex, cache, nextCache } = {}) {
    if (!node || typeof node !== 'object') {
        const hash = hashNode(node, []);
        return { node, hash };
    }

    const copy = { ...node };
    const childHashes = [];

    if (Array.isArray(copy.children)) {
        const children = [];
        for (const child of copy.children) {
            const result = attachHashes(child, { previousIndex, cache, nextCache });
            children.push(result.node);
            childHashes.push(result.hash);
        }
        copy.children = children;
    }

    let hash = null;
    const nodeId = node.id;
    const cacheKey = nodeId ? `${HASH_SCHEMA_VERSION}:${nodeId}` : null;
    const prevNode = nodeId && previousIndex ? previousIndex.get(nodeId) : null;
    const prevHash = cacheKey && cache ? cache.get(cacheKey) : null;

    if (prevNode && prevHash && shallowNormalizedEquals(node, prevNode)) {
        let childrenUnchanged = true;
        if (Array.isArray(node.children)) {
            const prevChildren = Array.isArray(prevNode.children) ? prevNode.children : [];
            if (prevChildren.length !== childHashes.length) {
                childrenUnchanged = false;
            } else {
                for (let i = 0; i < prevChildren.length; i += 1) {
                    const prevChildId = prevChildren[i]?.id;
                    const prevChildKey = prevChildId ? `${HASH_SCHEMA_VERSION}:${prevChildId}` : null;
                    const prevChildHash = prevChildKey ? cache.get(prevChildKey) : null;
                    if (prevChildHash !== childHashes[i]) {
                        childrenUnchanged = false;
                        break;
                    }
                }
            }
        }

        if (childrenUnchanged) {
            hash = prevHash;
        }
    }

    if (!hash) {
        hash = hashNode(copy, childHashes);
    }

    copy.__nodeHash = hash;
    if (cacheKey && nextCache) {
        nextCache.set(cacheKey, hash);
    }

    return { node: copy, hash };
}

export function hashEvaluatedScene(
    evaluatedScene,
    { previousEvaluatedScene = null, cache = null } = {}
) {
    const previousIndex = previousEvaluatedScene ? buildNodeIndex(previousEvaluatedScene) : null;
    const nextCache = cache ? new Map() : null;
    const hashedTree = attachHashes(evaluatedScene, { previousIndex, cache, nextCache });
    const rootHash = hashedTree.hash;
    if (cache && nextCache) {
        cache.clear();
        for (const [key, value] of nextCache.entries()) {
            cache.set(key, value);
        }
    }
    return rootHash;
}
