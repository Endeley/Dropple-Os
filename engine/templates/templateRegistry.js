const seedsById = new Map();
const seedsByHash = new Map();
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

export function registerTemplate(seed) {
    assertSeed(seed);

    const existingByHash = seedsByHash.get(seed.snapshotHash);
    if (existingByHash && existingByHash.id !== seed.id) {
        throw new Error(
            `Template snapshotHash already registered under different id: ${existingByHash.id}`
        );
    }

    const existingList = seedsById.get(seed.id) || [];
    const existingVersion = existingList.find((item) => item.version === seed.version);
    if (existingVersion) {
        return existingVersion;
    }

    if (existingList.length) {
        const latest = existingList[existingList.length - 1];
        const compare = compareSemver(seed.version, latest.version);
        if (compare != null && compare <= 0) {
            throw new Error('Template version must increment');
        }
        if (compare == null) {
            throw new Error('Template version must be a valid semver string');
        }
    }

    existingList.push(seed);
    seedsById.set(seed.id, existingList);
    seedsByHash.set(seed.snapshotHash, seed);
    orderedSeeds.push(seed);

    return seed;
}

export function listTemplates({ filter } = {}) {
    const list = [...orderedSeeds];
    if (typeof filter === 'function') {
        return list.filter((seed) => filter(seed.capabilityProfile, seed));
    }
    return list;
}

export function resetTemplateRegistry() {
    seedsById.clear();
    seedsByHash.clear();
    orderedSeeds.length = 0;
}
