import { certifyBlueprint, verifyBlueprintCertification } from './installBlueprint.js';
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

function hash(input) {
    return stableSha256LikeHex(input);
}

function normalizeNonEmptyString(value, label) {
    if (typeof value !== 'string') {
        throw new Error(`composeBlueprints: ${label} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new Error(`composeBlueprints: ${label} is required`);
    }
    return trimmed;
}

function normalizeBlueprintEntries(blueprints) {
    if (!Array.isArray(blueprints) || blueprints.length === 0) {
        throw new Error('composeBlueprints: blueprints array is required');
    }

    return blueprints.map((blueprint, index) => {
        if (!blueprint || typeof blueprint !== 'object') {
            throw new Error(`composeBlueprints: blueprint at index ${index} is invalid`);
        }
        if (!verifyBlueprintCertification(blueprint)) {
            throw new Error(`composeBlueprints: blueprint at index ${index} has invalid certification`);
        }
        return Object.freeze({
            order: index,
            blueprint,
            id: String(blueprint.id ?? ''),
            versionId: String(blueprint?.lineage?.versionId ?? blueprint.id ?? ''),
            rootId: String(blueprint?.lineage?.rootId ?? ''),
        });
    });
}

function mergeProfileMap(entries, field) {
    const accumulator = new Map();
    for (const entry of entries) {
        const source = entry.blueprint?.[field] ?? {};
        for (const [profileId, capabilities] of Object.entries(source)) {
            if (!Array.isArray(capabilities)) continue;
            const set = accumulator.get(profileId) ?? new Set();
            for (const capability of capabilities) {
                if (typeof capability !== 'string' || capability.trim().length === 0) continue;
                set.add(capability.trim());
            }
            accumulator.set(profileId, set);
        }
    }

    const merged = {};
    for (const profileId of [...accumulator.keys()].sort((a, b) => a.localeCompare(b))) {
        merged[profileId] = Object.freeze(
            [...accumulator.get(profileId)].sort((a, b) => a.localeCompare(b)),
        );
    }
    return Object.freeze(merged);
}

function mergeSeedEvents(entries) {
    const merged = [];
    for (const entry of entries) {
        const seedEvents = Array.isArray(entry.blueprint?.seedEvents) ? entry.blueprint.seedEvents : [];
        for (const seedEvent of seedEvents) {
            merged.push({
                type: seedEvent?.type ?? '',
                payload: seedEvent?.payload ?? {},
            });
        }
    }
    return Object.freeze(merged);
}

function buildLineage({ compositionId, entries }) {
    const versionSeed = entries.map((entry) => `${entry.id}@${entry.versionId}`).join('|');
    const versionHash = hash(versionSeed).slice(0, 16);
    const rootId = `bp.compose.${compositionId}`;
    return Object.freeze({
        rootId,
        versionId: `${rootId}.${versionHash}`,
        parentVersionId: null,
    });
}

export function composeBlueprints({
    compositionId,
    name,
    description = 'Composed blueprint package',
    kind = 'project',
    blueprints,
} = {}) {
    const normalizedCompositionId = normalizeNonEmptyString(compositionId, 'compositionId');
    const normalizedName = normalizeNonEmptyString(name, 'name');
    const entries = normalizeBlueprintEntries(blueprints);

    const workspaceProfiles = mergeProfileMap(entries, 'workspaceProfiles');
    const capabilityProfiles = mergeProfileMap(entries, 'capabilityProfiles');
    const seedEvents = mergeSeedEvents(entries);
    const sourceBlueprintRefs = Object.freeze(
        entries.map((entry) =>
            Object.freeze({
                id: entry.id,
                versionId: entry.versionId,
                rootId: entry.rootId || null,
                order: entry.order,
            }),
        ),
    );

    const composed = {
        id: `bp.compose.${normalizedCompositionId}`,
        version: 1,
        name: normalizedName,
        description,
        kind,
        workspaceProfiles,
        capabilityProfiles,
        seedGraph: Object.freeze({}),
        seedEvents,
        workflowPresets: Object.freeze({}),
        publishPresets: Object.freeze({}),
        lineage: buildLineage({ compositionId: normalizedCompositionId, entries }),
        composition: Object.freeze({
            sourceBlueprintRefs,
            compositionHash: hash(stableStringify(sourceBlueprintRefs)),
        }),
    };

    return certifyBlueprint(composed);
}
