import { validateSceneGraph } from '@/domain/templates/SceneGraphContract.js';

const RUNTIME_NODE_TYPE_BY_ARTIFACT_TYPE = Object.freeze({
    frame: 'frame',
    section: 'frame',
    container: 'frame',
    component: 'frame',
    text: 'text',
    image: 'image',
    button: 'button',
});

function resolveRuntimeNodeType(artifactType) {
    const type = RUNTIME_NODE_TYPE_BY_ARTIFACT_TYPE[artifactType];
    if (!type) {
        throw new Error(`uiux artifact builder does not support artifactType "${artifactType}"`);
    }
    return type;
}

function ensureArtifactModel(artifactModel) {
    if (!artifactModel || typeof artifactModel !== 'object') {
        throw new Error('uiux artifact builder requires an artifactModel object');
    }
    if (!artifactModel.root || typeof artifactModel.root !== 'object') {
        throw new Error('uiux artifact builder requires artifactModel.root');
    }
    if (!Array.isArray(artifactModel.artifacts)) {
        throw new Error('uiux artifact builder requires artifactModel.artifacts array');
    }
}

function buildRootNode(artifactModel) {
    return Object.freeze({
        id: artifactModel.root.id,
        type: resolveRuntimeNodeType(artifactModel.root.artifactType),
        name: artifactModel.root.label,
        metadata: Object.freeze({
            semanticRole: artifactModel.root.semanticRole,
        }),
        transform: Object.freeze({ x: 0, y: 0 }),
    });
}

function buildArtifactNode(entry) {
    return Object.freeze({
        id: entry.id,
        type: resolveRuntimeNodeType(entry.artifactType),
        name: entry.label,
        metadata: Object.freeze({
            semanticRole: entry.semanticRole,
            artifactType: entry.artifactType,
        }),
        transform: Object.freeze({ x: 0, y: 0 }),
    });
}

function compareByOrder(left, right) {
    const leftOrder = Number.isFinite(left?.order) ? Number(left.order) : 0;
    const rightOrder = Number.isFinite(right?.order) ? Number(right.order) : 0;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
}

function buildTree(artifactModel) {
    const entriesByParent = new Map();
    const tree = {
        [artifactModel.root.id]: [],
    };

    for (const artifact of artifactModel.artifacts) {
        tree[artifact.id] = [];

        const parentId = artifact.parentId ?? artifactModel.root.id;
        const existing = entriesByParent.get(parentId) ?? [];
        existing.push(artifact);
        entriesByParent.set(parentId, existing);
    }

    for (const [parentId, children] of entriesByParent.entries()) {
        tree[parentId] = Object.freeze(children.slice().sort(compareByOrder).map((entry) => entry.id));
    }

    return Object.freeze(tree);
}

export function buildUIUXArtifactGraph({ artifactModel } = {}) {
    ensureArtifactModel(artifactModel);

    const rootNode = buildRootNode(artifactModel);
    const artifactNodes = artifactModel.artifacts.map(buildArtifactNode);
    const nodes = Object.freeze([rootNode, ...artifactNodes]);
    const tree = buildTree(artifactModel);

    const graph = Object.freeze({
        rootId: artifactModel.root.id,
        nodes,
        tree,
        metadata: Object.freeze({}),
    });

    validateSceneGraph(graph);
    return graph;
}
