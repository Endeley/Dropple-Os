import { listBlueprintCatalog } from './blueprintCatalog.js';

function normalizeRequiredString(value, label) {
    if (typeof value !== 'string') {
        throw new Error(`resolveBlueprintCatalogEntry: ${label} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new Error(`resolveBlueprintCatalogEntry: ${label} is required`);
    }
    return trimmed;
}

function normalizeOptionalString(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function resolveBlueprintCatalogEntry({
    blueprintId,
    blueprintVersionId = null,
    certificationHash = null,
} = {}) {
    const normalizedId = normalizeRequiredString(blueprintId, 'blueprintId').toLowerCase();
    const normalizedVersionId = normalizeOptionalString(blueprintVersionId);
    const normalizedCertificationHash = normalizeOptionalString(certificationHash);

    const blueprint =
        listBlueprintCatalog().find((entry) => String(entry?.id ?? '').toLowerCase() === normalizedId) ?? null;
    if (!blueprint) {
        throw new Error(`resolveBlueprintCatalogEntry: unknown blueprint id "${blueprintId}"`);
    }

    const actualVersionId = String(blueprint?.lineage?.versionId ?? blueprint.id);
    if (normalizedVersionId && normalizedVersionId !== actualVersionId) {
        throw new Error(
            `resolveBlueprintCatalogEntry: blueprint version mismatch for "${blueprint.id}" (expected ${actualVersionId}, got ${normalizedVersionId})`,
        );
    }

    const actualCertificationHash = String(blueprint?.certification?.hash ?? '');
    if (actualCertificationHash.length === 0) {
        throw new Error(`resolveBlueprintCatalogEntry: blueprint "${blueprint.id}" is missing certification hash`);
    }
    if (normalizedCertificationHash && normalizedCertificationHash !== actualCertificationHash) {
        throw new Error(
            `resolveBlueprintCatalogEntry: certification hash mismatch for "${blueprint.id}"`,
        );
    }

    return Object.freeze({
        blueprint,
        blueprintId: blueprint.id,
        blueprintVersionId: actualVersionId,
        certificationHash: actualCertificationHash,
    });
}

