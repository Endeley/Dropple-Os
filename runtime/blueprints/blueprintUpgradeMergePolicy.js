import crypto from 'node:crypto';

function stableStringify(value) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (typeof value === 'object') {
        const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
        return `{${keys.map((key) => `"${key}":${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
}

export function computeBlueprintUpgradeMergePolicyHash(mergePolicy) {
    return crypto.createHash('sha256').update(stableStringify(mergePolicy)).digest('hex');
}

function isObjectLike(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function collectChangedPaths(fromValue, toValue, prefix = '', paths = []) {
    if (stableStringify(fromValue) === stableStringify(toValue)) {
        return paths;
    }

    if (!isObjectLike(fromValue) || !isObjectLike(toValue)) {
        paths.push(prefix || '$');
        return paths;
    }

    const keys = new Set([...Object.keys(fromValue), ...Object.keys(toValue)]);
    for (const key of [...keys].sort((a, b) => a.localeCompare(b))) {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        collectChangedPaths(fromValue[key], toValue[key], nextPrefix, paths);
    }
    return paths;
}

export const DEFAULT_BLUEPRINT_UPGRADE_MERGE_POLICY = Object.freeze({
    version: 1,
    allowChangedPaths: Object.freeze([
        'id',
        'seedEvents',
        'lineage.versionId',
        'lineage.parentVersionId',
        'certification.hash',
    ]),
});

function isPathAllowed(path, allowChangedPaths) {
    return allowChangedPaths.some((allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}.`));
}

export function evaluateBlueprintUpgradeMergePolicy({
    fromBlueprint,
    toBlueprint,
    mergePolicy = DEFAULT_BLUEPRINT_UPGRADE_MERGE_POLICY,
} = {}) {
    const allowChangedPaths = Array.isArray(mergePolicy?.allowChangedPaths)
        ? mergePolicy.allowChangedPaths.map((path) => String(path))
        : [];
    if (allowChangedPaths.length === 0) {
        throw new Error('evaluateBlueprintUpgradeMergePolicy: merge policy must define allowChangedPaths');
    }

    const changedPaths = collectChangedPaths(fromBlueprint, toBlueprint);
    const disallowedPaths = changedPaths.filter((path) => !isPathAllowed(path, allowChangedPaths));
    return Object.freeze({
        ok: disallowedPaths.length === 0,
        changedPaths: Object.freeze(changedPaths),
        disallowedPaths: Object.freeze(disallowedPaths),
        policyVersion: Number(mergePolicy?.version ?? 0),
    });
}
