import { EventTypes } from '@/core/events/eventTypes.js';
import { buildUIUXArtifactGraph } from '@/domain/creativeBlueprint/buildUIUXArtifactGraph.js';
import { certifyBlueprint } from './installBlueprint.js';
import { stableSha256LikeHex } from './stableHash.js';

function stableStringify(value) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (typeof value === 'object') {
        const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
        return `{${keys.map((key) => `"${key}":${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
}

function normalizeArtifactModelForCompilation(artifactModel) {
    return {
        schemaVersion: artifactModel?.schemaVersion ?? null,
        world: artifactModel?.world ?? null,
        scenario: artifactModel?.scenario ?? null,
        purpose: artifactModel?.purpose ?? null,
        root: artifactModel?.root ?? null,
        artifacts: Array.isArray(artifactModel?.artifacts) ? artifactModel.artifacts : [],
        structuralRelationships: Array.isArray(artifactModel?.structuralRelationships)
            ? artifactModel.structuralRelationships
            : [],
    };
}

function normalizeToken(value, fallback) {
    if (typeof value !== 'string') return fallback;
    const normalized = value
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return normalized.length > 0 ? normalized : fallback;
}

function humanizeToken(value, fallback) {
    const token = typeof value === 'string' && value.trim().length > 0 ? value : fallback;
    return token
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (character) => character.toUpperCase());
}

function freezeObjectMap(record) {
    return Object.freeze(
        Object.fromEntries(
            Object.entries(record).map(([key, value]) => [key, Object.freeze(value)]),
        ),
    );
}

function buildSeedGraph(graph) {
    return Object.freeze({
        rootId: graph.rootId,
        rootIds: Object.freeze([graph.rootId]),
        nodes: freezeObjectMap(
            Object.fromEntries(
                graph.nodes.map((node) => [
                    node.id,
                    {
                        id: node.id,
                        type: node.type,
                        name: node.name,
                        metadata: node.metadata,
                        transform: node.transform,
                    },
                ]),
            ),
        ),
        tree: Object.freeze(
            Object.fromEntries(
                Object.entries(graph.tree).map(([parentId, childIds]) => [
                    parentId,
                    Object.freeze([...childIds]),
                ]),
            ),
        ),
        metadata: Object.freeze({}),
    });
}

function buildParentIndex(tree) {
    const parentIndex = new Map();
    for (const [parentId, childIds] of Object.entries(tree)) {
        for (const childId of childIds) {
            parentIndex.set(childId, parentId);
        }
    }
    return parentIndex;
}

function buildTraversalOrder(graph) {
    const orderedIds = [];

    function visit(nodeId) {
        orderedIds.push(nodeId);
        const childIds = graph.tree[nodeId] ?? [];
        for (const childId of childIds) {
            visit(childId);
        }
    }

    visit(graph.rootId);
    return orderedIds;
}

function buildSeedEvents(graph) {
    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    const parentIndex = buildParentIndex(graph.tree);

    return Object.freeze(
        buildTraversalOrder(graph).map((nodeId) => {
            const node = nodeById.get(nodeId);
            const parentId = parentIndex.get(nodeId) ?? null;
            return Object.freeze({
                type: EventTypes.NODE_CREATE,
                payload: Object.freeze({
                    node: Object.freeze({
                        id: node.id,
                        type: node.type,
                        ...(parentId ? { parentId } : {}),
                        name: node.name,
                        metadata: node.metadata,
                        transform: node.transform,
                        layout: Object.freeze({ x: 0, y: 0 }),
                    }),
                }),
            });
        }),
    );
}

function buildLineage(artifactModel, contentHash) {
    const scenarioToken = normalizeToken(artifactModel?.scenario, 'artifact-model');
    const rootId = `bp.artifact.${scenarioToken}.root`;
    const versionId = `bp.artifact.${scenarioToken}.${contentHash.slice(0, 16)}`;
    return Object.freeze({
        rootId,
        versionId,
        parentVersionId: null,
    });
}

export function compileArtifactModelToBlueprintV1({ artifactModel } = {}) {
    const graph = buildUIUXArtifactGraph({ artifactModel });
    const contentHash = stableSha256LikeHex(
        stableStringify(normalizeArtifactModelForCompilation(artifactModel)),
    );
    const lineage = buildLineage(artifactModel, contentHash);
    const scenarioName = humanizeToken(artifactModel?.scenario, 'Artifact Model');

    return certifyBlueprint({
        id: lineage.versionId,
        version: 1,
        name: `${scenarioName} Blueprint`,
        description:
            typeof artifactModel?.purpose === 'string' && artifactModel.purpose.trim().length > 0
                ? artifactModel.purpose.trim()
                : `${scenarioName} compiled from Artifact Model`,
        kind: 'project',
        workspaceProfiles: Object.freeze({}),
        capabilityProfiles: Object.freeze({}),
        seedGraph: buildSeedGraph(graph),
        seedEvents: buildSeedEvents(graph),
        workflowPresets: Object.freeze({}),
        publishPresets: Object.freeze({}),
        lineage,
    });
}
