import { resolveBlueprintCatalogEntry } from './resolveBlueprintCatalogEntry.js';
import { composeBlueprints } from './composeBlueprints.js';
import { stableSha256LikeHex } from './stableHash.js';

function normalizeCompositeString(value, fallback) {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeCompositionEntries(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error('resolveBlueprintCompositionFromCatalog: entries array is required');
    }
    return entries.map((entry) => {
        if (typeof entry === 'string') {
            return Object.freeze({ blueprintId: entry });
        }
        if (!entry || typeof entry !== 'object') {
            throw new Error('resolveBlueprintCompositionFromCatalog: each entry must be a string or object');
        }
        return Object.freeze({
            blueprintId: entry.blueprintId,
            blueprintVersionId: entry.blueprintVersionId ?? null,
            certificationHash: entry.certificationHash ?? null,
        });
    });
}

export function resolveBlueprintCompositionFromCatalog({
    entries,
    compositeId = null,
    compositeName = null,
    compositeDescription = 'Composed blueprint package',
    kind = 'project',
} = {}) {
    const normalizedEntries = normalizeCompositionEntries(entries);
    const resolvedEntries = normalizedEntries.map((entry) => resolveBlueprintCatalogEntry(entry));
    const versionPath = resolvedEntries.map((entry) => entry.blueprintVersionId).join('+');
    const compositionHash = stableSha256LikeHex(versionPath);
    const resolvedId = normalizeCompositeString(compositeId, compositionHash.slice(0, 12));
    const resolvedName = normalizeCompositeString(compositeName, 'Composed Blueprint');
    const resolvedDescription = normalizeCompositeString(compositeDescription, 'Composed blueprint package');

    const blueprint = composeBlueprints({
        compositionId: resolvedId,
        name: resolvedName,
        description: resolvedDescription,
        kind: normalizeCompositeString(kind, 'project'),
        blueprints: resolvedEntries.map((entry) => entry.blueprint),
    });

    return Object.freeze({
        blueprint,
        entries: Object.freeze(resolvedEntries),
        compositionHash,
    });
}
