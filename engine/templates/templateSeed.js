import crypto from 'crypto';
import { createTemplateSeedLineageNode } from '../../domain/templates/TemplateSeedLineageGraph.js';

function deepFreeze(value) {
    if (!value || typeof value !== 'object') return value;
    Object.freeze(value);
    if (Array.isArray(value)) {
        value.forEach((item) => deepFreeze(item));
    } else {
        Object.keys(value).forEach((key) => deepFreeze(value[key]));
    }
    return value;
}

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map((item) => stableSerialize(item));
    }

    if (value && typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }

    return value;
}

function hashObject(value) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(stableSerialize(value)))
        .digest('hex');
}

function normalizeContentHashInputs(contentHashInputs) {
    if (!contentHashInputs || typeof contentHashInputs !== 'object') {
        throw new Error('Template seed contentHashInputs must be a non-empty object');
    }

    return stableSerialize(contentHashInputs);
}

export function buildTemplateSeedContentHashInputs({
    id,
    version,
    metadata,
    baseSceneGraph,
    states,
    defaultState,
    params,
}) {
    return normalizeContentHashInputs({
        templateId: id,
        templateVersion: version,
        engineVersion: metadata?.engine ?? 'dropple-motion@1.x',
        baseSceneGraph,
        states,
        defaultState,
        params: params ?? {},
    });
}

export function deriveTemplateSeedContentHash(contentHashInputs) {
    return hashObject(normalizeContentHashInputs(contentHashInputs));
}

export function resolveTemplateSeedIdentity(seedLike = {}) {
    const contentHashInputs =
        seedLike.contentHashInputs ??
        buildTemplateSeedContentHashInputs({
            id: seedLike.id,
            version: seedLike.version,
            metadata: seedLike.metadata,
            baseSceneGraph: seedLike.baseSceneGraph,
            states: seedLike.states,
            defaultState: seedLike.defaultState,
            params: seedLike.params,
        });

    const derivedContentHash = deriveTemplateSeedContentHash(contentHashInputs);
    if (seedLike.contentHash && seedLike.contentHash !== derivedContentHash) {
        throw new Error('Template seed contentHash does not match contentHashInputs');
    }

    const lineageNode = createTemplateSeedLineageNode({
        id: seedLike?.lineage?.nodeId ?? seedLike?.lineage?.id,
        type: seedLike?.lineage?.type ?? 'seed',
        parentIds: seedLike?.lineage?.parentIds ?? [],
        contentHash: derivedContentHash,
    });

    const resolvedRootId = seedLike?.lineage?.rootId ?? lineageNode.id;
    if (typeof resolvedRootId !== 'string' || resolvedRootId.trim().length === 0) {
        throw new Error('Template seed lineage rootId must be a non-empty string');
    }

    if (lineageNode.parentIds.length === 0 && resolvedRootId !== lineageNode.id) {
        throw new Error(
            'Template seed root lineage nodes must use their derived node id as lineage rootId',
        );
    }

    return {
        contentHashInputs,
        contentHash: derivedContentHash,
        lineage: {
            rootId: resolvedRootId,
            nodeId: lineageNode.id,
            type: lineageNode.type,
            parentIds: lineageNode.parentIds,
        },
    };
}

export function createTemplateSeed({
    id,
    version,
    snapshotHash,
    baseSceneGraph,
    states,
    defaultState,
    capabilityProfile,
    metadata,
    params,
    contentHash,
    contentHashInputs,
    lineage,
}) {
    const identity = resolveTemplateSeedIdentity({
        id,
        version,
        metadata,
        baseSceneGraph,
        states,
        defaultState,
        params,
        contentHash,
        contentHashInputs,
        lineage,
    });

    const seed = {
        id,
        version,
        snapshotHash,
        contentHash: identity.contentHash,
        contentHashInputs: identity.contentHashInputs,
        lineage: identity.lineage,
        baseSceneGraph,
        states,
        defaultState,
        capabilityProfile,
        metadata,
        params,
    };

    return deepFreeze(seed);
}
