import fs from 'fs';
import path from 'path';
import {
    isAncestorVersion,
    normalizeParentVersionIds,
    topologicalOrderVersions,
    validateVersionGraph,
} from '../../core/events/tokenVersionGraph.js';
import { validateSemVer, compareVersions } from './TemplateVersioning.js';
import { verifyTemplateCertification } from './TemplateCertification.js';
import { computeRegistryFingerprint } from './TemplateRegistryIntegrity.js';

export const REGISTRY_FORMAT = 'dropple-certified-template-registry@2';
export const REGISTRY_VERSION = 2;

function getRegistryPath() {
    return path.join(process.cwd(), '.registry', 'certifiedTemplates.json');
}

function stableClone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

function freezeDeep(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);
    if (Array.isArray(value)) {
        value.forEach((item) => freezeDeep(item));
        return value;
    }

    Object.values(value).forEach((item) => freezeDeep(item));
    return value;
}

function saveRegistryEnvelope(envelope) {
    const registryPath = getRegistryPath();
    const dir = path.dirname(registryPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(registryPath, JSON.stringify(envelope, null, 2));
}

function resolveTemplateEntry({ template, seed }) {
    return seed ?? template ?? null;
}

function assertCertifiedTemplateIdentity(template) {
    if (!template || typeof template !== 'object') {
        throw new Error('Template registry entry must be an object.');
    }
    if (typeof template.id !== 'string' || template.id.length === 0) {
        throw new Error('Template id is required.');
    }
    if (typeof template.version !== 'string' || template.version.length === 0) {
        throw new Error('Template version is required.');
    }
    if (!template.certification || typeof template.certification !== 'object') {
        throw new Error('Certified template registry entries require certification.');
    }
}

function normalizeCertifiedEntry(entry) {
    assertCertifiedTemplateIdentity(entry);

    const certification = entry.certification ?? {};
    const rawParentVersionIds = entry.parentVersionIds ?? entry.lineage?.parentIds ?? [];
    const versionId = certification.lineageNodeId ?? entry.versionId ?? null;
    const lineageRootId = certification.lineageRootId ?? entry.lineageRootId ?? null;
    const parentVersionIds = normalizeParentVersionIds(rawParentVersionIds);

    if (typeof versionId !== 'string' || versionId.length === 0) {
        throw new Error('Certified template registry entries require a lineage versionId.');
    }
    if (typeof lineageRootId !== 'string' || lineageRootId.length === 0) {
        throw new Error('Certified template registry entries require a lineageRootId.');
    }
    if (certification.lineageNodeId && certification.lineageNodeId !== versionId) {
        throw new Error('Certified template lineage node identity mismatch.');
    }
    if (certification.lineageRootId && certification.lineageRootId !== lineageRootId) {
        throw new Error('Certified template lineage root identity mismatch.');
    }
    if (
        Array.isArray(rawParentVersionIds) &&
        rawParentVersionIds.filter((value) => typeof value === 'string').length !== parentVersionIds.length
    ) {
        throw new Error('Certified template lineage parent ids must be unique.');
    }

    return freezeDeep({
        ...stableClone(entry),
        versionId,
        lineageRootId,
        parentVersionIds,
    });
}

export function createRegistryEnvelope(entriesInput = []) {
    const entries = entriesInput.map((entry) => normalizeCertifiedEntry(entry));
    const entriesByVersionId = new Map();
    const entriesByLineageRootId = new Map();

    for (const entry of entries) {
        if (entriesByVersionId.has(entry.versionId)) {
            throw new Error(
                `Certified template ${entry.id}@${entry.version} duplicates versionId ${entry.versionId}.`,
            );
        }
        entriesByVersionId.set(entry.versionId, entry);
        const siblings = entriesByLineageRootId.get(entry.lineageRootId) ?? [];
        siblings.push(entry);
        entriesByLineageRootId.set(entry.lineageRootId, siblings);
    }

    const graph = {
        entries: Object.fromEntries(
            entries.map((entry) => [
                entry.versionId,
                {
                    id: entry.versionId,
                    parentVersionIds: entry.parentVersionIds,
                },
            ]),
        ),
        order: entries.map((entry) => entry.versionId),
    };

    const validation = validateVersionGraph(graph);
    if (!validation.ok) {
        throw new Error(`Certified template lineage invalid: ${validation.reason}`);
    }

    const topoOrder = topologicalOrderVersions(graph);
    const topoIndex = new Map(topoOrder.map((versionId, index) => [versionId, index]));

    const orderedEntries = [...entries].sort((left, right) => {
        const leftIndex = topoIndex.get(left.versionId) ?? Number.MAX_SAFE_INTEGER;
        const rightIndex = topoIndex.get(right.versionId) ?? Number.MAX_SAFE_INTEGER;
        if (leftIndex !== rightIndex) {
            return leftIndex - rightIndex;
        }

        const semverCompare = compareVersions(left.version, right.version);
        if (semverCompare !== 0) return semverCompare;
        return left.versionId.localeCompare(right.versionId);
    });

    const lineageRoots = Object.fromEntries(
        [...entriesByLineageRootId.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([lineageRootId, rootEntries]) => {
                const orderedVersionIds = [...rootEntries]
                    .sort((left, right) => {
                        const leftIndex = topoIndex.get(left.versionId) ?? Number.MAX_SAFE_INTEGER;
                        const rightIndex = topoIndex.get(right.versionId) ?? Number.MAX_SAFE_INTEGER;
                        if (leftIndex !== rightIndex) {
                            return leftIndex - rightIndex;
                        }

                        const semverCompare = compareVersions(left.version, right.version);
                        if (semverCompare !== 0) return semverCompare;
                        return left.versionId.localeCompare(right.versionId);
                    })
                    .map((entry) => entry.versionId);

                return [lineageRootId, Object.freeze(orderedVersionIds)];
            }),
    );

    const envelope = {
        format: REGISTRY_FORMAT,
        version: REGISTRY_VERSION,
        entries: freezeDeep(orderedEntries.map((entry) => stableClone(entry))),
        lineageRoots: freezeDeep(lineageRoots),
    };

    return freezeDeep(envelope);
}

function readRegistryPayload() {
    const registryPath = getRegistryPath();
    if (!fs.existsSync(registryPath)) {
        return null;
    }

    const raw = fs.readFileSync(registryPath, 'utf-8');
    return JSON.parse(raw);
}

export function loadRegistry() {
    const payload = readRegistryPayload();
    if (!payload) {
        return createRegistryEnvelope([]);
    }

    if (Array.isArray(payload)) {
        return createRegistryEnvelope(payload);
    }

    if (payload && typeof payload === 'object' && Array.isArray(payload.entries)) {
        return createRegistryEnvelope(payload.entries);
    }

    throw new Error('Certified template registry corrupted.');
}

export function loadRegistryEntries() {
    return [...loadRegistry().entries];
}

export function getByVersionId(versionId) {
    if (typeof versionId !== 'string' || versionId.length === 0) return null;
    return loadRegistry().entries.find((entry) => entry.versionId === versionId) ?? null;
}

export function getLineageRoot(lineageRootId) {
    if (typeof lineageRootId !== 'string' || lineageRootId.length === 0) return null;
    const registry = loadRegistry();
    const versionIds = registry.lineageRoots[lineageRootId];
    if (!versionIds) return null;

    return Object.freeze({
        lineageRootId,
        versionIds: [...versionIds],
    });
}

export function listLineageVersions(lineageRootId) {
    const lineageRoot = getLineageRoot(lineageRootId);
    if (!lineageRoot) return [];
    return lineageRoot.versionIds
        .map((versionId) => getByVersionId(versionId))
        .filter(Boolean);
}

export function resolveTemplateByLineageKey({ lineageRootId, versionId } = {}) {
    if (typeof lineageRootId !== 'string' || lineageRootId.length === 0) return null;
    if (typeof versionId !== 'string' || versionId.length === 0) return null;

    const lineageRoot = getLineageRoot(lineageRootId);
    if (!lineageRoot) return null;
    if (!lineageRoot.versionIds.includes(versionId)) return null;

    return getByVersionId(versionId);
}

function ensureAppendOnly(registry, newEntry) {
    const duplicateVersion = registry.entries.find(
        (entry) => entry.versionId === newEntry.versionId,
    );
    if (duplicateVersion) {
        throw new Error(
            `Template lineage version ${newEntry.versionId} already exists in registry.`,
        );
    }

    const duplicateIdVersion = registry.entries.find(
        (entry) => entry.id === newEntry.id && entry.version === newEntry.version,
    );
    if (duplicateIdVersion) {
        throw new Error(
            `Template ${newEntry.id}@${newEntry.version} already exists in registry.`,
        );
    }
}

function enforceVersionProgression(existingEntries, newEntry) {
    const versions = existingEntries
        .filter((entry) => entry.id === newEntry.id)
        .map((entry) => entry.version);

    if (versions.length === 0) return;

    const highest = versions.sort(compareVersions).pop();
    if (compareVersions(newEntry.version, highest) <= 0) {
        throw new Error(
            `Version must be greater than existing highest version (${highest}).`,
        );
    }
}

function validateLineageAgainstRegistry(registry, newEntry) {
    const parentVersionIds = newEntry.parentVersionIds ?? [];

    if (parentVersionIds.length === 0) {
        if (newEntry.lineageRootId !== newEntry.versionId) {
            throw new Error('Root certified templates must use versionId as lineageRootId.');
        }
        return;
    }

    for (const parentVersionId of parentVersionIds) {
        const parent = registry.entries.find((entry) => entry.versionId === parentVersionId);
        if (!parent) {
            throw new Error(`Certified template lineage parent missing from registry: ${parentVersionId}`);
        }
        if (parent.lineageRootId !== newEntry.lineageRootId) {
            throw new Error(
                `Certified template lineage root mismatch for parent ${parentVersionId}: expected ${parent.lineageRootId}, received ${newEntry.lineageRootId}`,
            );
        }
    }

    if (parentVersionIds.length > 1) {
        const graph = {
            entries: Object.fromEntries(
                registry.entries.map((entry) => [
                    entry.versionId,
                    {
                        id: entry.versionId,
                        parentVersionIds: entry.parentVersionIds ?? [],
                    },
                ]),
            ),
            order: registry.entries.map((entry) => entry.versionId),
        };

        for (let index = 0; index < parentVersionIds.length; index += 1) {
            for (let compareIndex = index + 1; compareIndex < parentVersionIds.length; compareIndex += 1) {
                const left = parentVersionIds[index];
                const right = parentVersionIds[compareIndex];
                if (
                    isAncestorVersion(graph, left, right) ||
                    isAncestorVersion(graph, right, left)
                ) {
                    throw new Error(
                        `Certified template merge parents must not be ancestor-related: ${left}, ${right}`,
                    );
                }
            }
        }
    }
}

export function registerCertifiedTemplate({
    template,
    seed,
    engineVersion,
    publicKey,
}) {
    const entry = normalizeCertifiedEntry(resolveTemplateEntry({ template, seed }));
    const registry = loadRegistry();
    const verification = verifyTemplateCertification({
        template: entry,
        engineVersion,
        publicKey,
    });

    if (!verification.valid) {
        throw new Error(`Certification invalid: ${verification.reason}`);
    }

    validateSemVer(entry.version);
    ensureAppendOnly(registry, entry);
    enforceVersionProgression(registry.entries, entry);
    validateLineageAgainstRegistry(registry, entry);

    const updatedEntries = [...registry.entries, entry];
    const updatedRegistry = createRegistryEnvelope(updatedEntries);
    saveRegistryEnvelope(updatedRegistry);

    return {
        registered: true,
        fingerprint: computeRegistryFingerprint(updatedRegistry),
        size: updatedRegistry.entries.length,
        versionId: entry.versionId,
        lineageRootId: entry.lineageRootId,
    };
}

export function registerTemplate(args) {
    return registerCertifiedTemplate(args);
}
