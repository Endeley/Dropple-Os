import { resolveTemplateSeedIdentity } from './templateSeed.js';

const seedsById = new Map();
const seedsByHash = new Map();
const seedsByVersionId = new Map();
const seedsByLineageRootId = new Map();
const orderedSeeds = [];

function parseSemver(version) {
    if (typeof version !== 'string') return null;
    const parts = version.split('.').map((part) => Number(part));
    if (parts.some((part) => !Number.isFinite(part))) return null;
    return parts;
}

function compareSemver(a, b) {
    const parsedA = parseSemver(a);
    const parsedB = parseSemver(b);
    if (!parsedA || !parsedB) return null;
    const length = Math.max(parsedA.length, parsedB.length);
    for (let i = 0; i < length; i += 1) {
        const left = parsedA[i] ?? 0;
        const right = parsedB[i] ?? 0;
        if (left > right) return 1;
        if (left < right) return -1;
    }
    return 0;
}

function assertSeed(seed) {
    if (!seed || typeof seed !== 'object') {
        throw new Error('Template seed must be an object');
    }
    if (!seed.id || typeof seed.id !== 'string') {
        throw new Error('Template seed.id must be a non-empty string');
    }
    if (!seed.version || typeof seed.version !== 'string') {
        throw new Error('Template seed.version must be a non-empty string');
    }
    if (!seed.snapshotHash || typeof seed.snapshotHash !== 'string') {
        throw new Error('Template seed.snapshotHash must be a non-empty string');
    }
}

function freezeRegisteredSeed(seed) {
    return Object.freeze({
        ...seed,
        parentVersionIds: Object.freeze([...(seed.parentVersionIds ?? [])]),
    });
}

function normalizeRegisteredSeed(seed) {
    assertSeed(seed);

    const identity = resolveTemplateSeedIdentity(seed);
    return freezeRegisteredSeed({
        ...seed,
        contentHash: identity.contentHash,
        contentHashInputs: identity.contentHashInputs,
        lineage: identity.lineage,
        lineageRootId: identity.lineage.rootId,
        versionId: identity.lineage.nodeId,
        parentVersionIds: identity.lineage.parentIds,
    });
}

function ensureParentLinkage(seed) {
    const parentVersionIds = seed.parentVersionIds ?? [];

    if (parentVersionIds.length === 0) {
        if (seed.lineageRootId !== seed.versionId) {
            throw new Error('Root template seeds must use their own versionId as lineageRootId');
        }
        return;
    }

    for (const parentVersionId of parentVersionIds) {
        const parentSeed = seedsByVersionId.get(parentVersionId);
        if (!parentSeed) {
            throw new Error(`Unknown template lineage parent: ${parentVersionId}`);
        }
        if (parentSeed.lineageRootId !== seed.lineageRootId) {
            throw new Error(
                `Template lineage root mismatch for parent ${parentVersionId}: expected ${parentSeed.lineageRootId}, received ${seed.lineageRootId}`,
            );
        }
    }
}

function ensureVersionProgression(seed) {
    const existingList = seedsById.get(seed.id) || [];
    if (!existingList.length) return;

    const latest = existingList[existingList.length - 1];
    const compare = compareSemver(seed.version, latest.version);
    if (compare != null && compare <= 0) {
        throw new Error('Template version must increment');
    }
    if (compare == null) {
        throw new Error('Template version must be a valid semver string');
    }
}

function appendIndex(map, key, value) {
    const existing = map.get(key) ?? [];
    existing.push(value);
    map.set(key, existing);
}

export function registerTemplate(seed) {
    const normalizedSeed = normalizeRegisteredSeed(seed);

    const existingByVersionId = seedsByVersionId.get(normalizedSeed.versionId);
    if (existingByVersionId) {
        if (
            existingByVersionId.id !== normalizedSeed.id ||
            existingByVersionId.version !== normalizedSeed.version
        ) {
            throw new Error(
                `Template lineage versionId already registered under different identity: ${existingByVersionId.id}@${existingByVersionId.version}`,
            );
        }
        return existingByVersionId;
    }

    const existingList = seedsById.get(normalizedSeed.id) || [];
    const existingVersion = existingList.find((item) => item.version === normalizedSeed.version);
    if (existingVersion) {
        if (existingVersion.versionId !== normalizedSeed.versionId) {
            throw new Error(
                `Template ${normalizedSeed.id}@${normalizedSeed.version} already registered with a different lineage versionId`,
            );
        }
        return existingVersion;
    }

    ensureParentLinkage(normalizedSeed);
    ensureVersionProgression(normalizedSeed);

    existingList.push(normalizedSeed);
    seedsById.set(normalizedSeed.id, existingList);
    seedsByVersionId.set(normalizedSeed.versionId, normalizedSeed);
    appendIndex(seedsByHash, normalizedSeed.snapshotHash, normalizedSeed);
    appendIndex(seedsByLineageRootId, normalizedSeed.lineageRootId, normalizedSeed);
    orderedSeeds.push(normalizedSeed);

    return normalizedSeed;
}

export function listTemplates({ filter } = {}) {
    const list = [...orderedSeeds];
    if (typeof filter === 'function') {
        return list.filter((seed) => filter(seed.capabilityProfile, seed));
    }
    return list;
}

export function getTemplateByVersionId(versionId) {
    return seedsByVersionId.get(versionId) ?? null;
}

export function listTemplateLineage(lineageRootId) {
    return [...(seedsByLineageRootId.get(lineageRootId) ?? [])];
}

export function resetTemplateRegistry() {
    seedsById.clear();
    seedsByHash.clear();
    seedsByVersionId.clear();
    seedsByLineageRootId.clear();
    orderedSeeds.length = 0;
}
