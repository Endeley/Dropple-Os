import crypto from 'node:crypto';
import { EventTypes } from '@/core/events/eventTypes.js';
import { validateBlueprintInstallManifestV1 } from '@/core/contracts/blueprintInstallManifest.v1.js';

function sha256(input) {
    return crypto.createHash('sha256').update(String(input)).digest('hex');
}

function stableStringify(value) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (typeof value === 'object') {
        const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
        return `{${keys.map((key) => `"${key}":${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value);
}

function normalizeBlueprintForHash(blueprint) {
    return {
        id: String(blueprint?.id ?? ''),
        version: Number(blueprint?.version ?? 1),
        name: String(blueprint?.name ?? ''),
        description: String(blueprint?.description ?? ''),
        kind: String(blueprint?.kind ?? ''),
        workspaceProfiles: blueprint?.workspaceProfiles ?? {},
        capabilityProfiles: blueprint?.capabilityProfiles ?? {},
        seedGraph: blueprint?.seedGraph ?? {},
        seedEvents: Array.isArray(blueprint?.seedEvents) ? blueprint.seedEvents : [],
        workflowPresets: blueprint?.workflowPresets ?? {},
        publishPresets: blueprint?.publishPresets ?? {},
        lineage: blueprint?.lineage ?? { rootId: null, versionId: null, parentVersionId: null },
    };
}

export function computeBlueprintCertificationHash(blueprint) {
    return sha256(stableStringify(normalizeBlueprintForHash(blueprint)));
}

export function certifyBlueprint(blueprint) {
    const hash = computeBlueprintCertificationHash(blueprint);
    return Object.freeze({
        ...blueprint,
        certification: Object.freeze({
            algorithm: 'sha256',
            hash,
        }),
    });
}

export function verifyBlueprintCertification(blueprint) {
    if (!blueprint || typeof blueprint !== 'object') return false;
    if (blueprint?.certification?.algorithm !== 'sha256') return false;
    const expected = computeBlueprintCertificationHash(blueprint);
    return String(blueprint?.certification?.hash ?? '') === expected;
}

function validateBlueprintInstallInput({ dispatcher, blueprint, manifest }) {
    if (!dispatcher || typeof dispatcher.dispatch !== 'function') {
        throw new Error('installBlueprint: dispatcher with dispatch(event) is required');
    }
    if (!blueprint || typeof blueprint !== 'object') {
        throw new Error('installBlueprint: blueprint is required');
    }
    if (!Array.isArray(blueprint.seedEvents)) {
        throw new Error('installBlueprint: blueprint.seedEvents must be an array');
    }

    validateBlueprintInstallManifestV1({
        ...manifest,
        blueprintId: manifest?.blueprintId ?? blueprint?.id ?? '',
        blueprintVersionId: manifest?.blueprintVersionId ?? blueprint?.lineage?.versionId ?? blueprint?.id ?? '',
    });
}

export async function installBlueprint({ dispatcher, blueprint, manifest }) {
    validateBlueprintInstallInput({ dispatcher, blueprint, manifest });
    const normalizedManifest = validateBlueprintInstallManifestV1({
        ...manifest,
        blueprintId: manifest?.blueprintId ?? blueprint?.id ?? '',
        blueprintVersionId: manifest?.blueprintVersionId ?? blueprint?.lineage?.versionId ?? blueprint?.id ?? '',
    });

    const appliedEvents = [];
    const bootstrapEvent = {
        type: EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP,
        payload: normalizedManifest,
    };

    await dispatcher.dispatch(bootstrapEvent);
    appliedEvents.push(bootstrapEvent);

    for (const rawEvent of blueprint.seedEvents) {
        if (!rawEvent || typeof rawEvent !== 'object') {
            throw new Error('installBlueprint: seed event must be an object');
        }
        if (typeof rawEvent.type !== 'string' || rawEvent.type.length === 0) {
            throw new Error('installBlueprint: seed event type must be a non-empty string');
        }

        const event = {
            type: rawEvent.type,
            payload: rawEvent.payload ?? {},
        };

        await dispatcher.dispatch(event);
        appliedEvents.push(event);
    }

    const state = dispatcher.getState();
    return Object.freeze({
        blueprintId: blueprint.id,
        projectId: normalizedManifest.projectId,
        bootstrapEvent,
        appliedEvents: Object.freeze(appliedEvents),
        stateHash: sha256(stableStringify(state?.document ?? {})),
    });
}
