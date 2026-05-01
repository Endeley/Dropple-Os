import { normalizeTimeline, hashTimeline } from '../domain/timeline/TimelineContract.js';
import { createTimelineController } from '../engine/timeline/timelineController.js';
import { computeCapabilityIndex } from '../engine/observability/capabilityIndex.js';
import { createTemplateSeed } from '../engine/templates/templateSeed.js';
import { certifyTemplateSeed } from '../engine/templates/certifyTemplateSeed.js';
import {
    getByVersionId,
    registerCertifiedTemplate,
} from '../domain/templates/TemplateRegistry.js';
import {
    hashEngineVersion,
    registerTemplateCertification,
} from '../domain/templates/TemplateCertification.js';

function deepClone(value) {
    if (value == null) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function assertSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('publishTemplateFork requires a snapshot object');
    }
    if (typeof snapshot.version !== 'string' || snapshot.version.length === 0) {
        throw new Error('Fork publication snapshot.version is required');
    }
    if (!('baseSceneGraph' in snapshot)) {
        throw new Error('Fork publication snapshot.baseSceneGraph is required');
    }
    if (!('states' in snapshot)) {
        throw new Error('Fork publication snapshot.states is required');
    }
    if (!('defaultState' in snapshot)) {
        throw new Error('Fork publication snapshot.defaultState is required');
    }
    if (!('params' in snapshot)) {
        throw new Error('Fork publication snapshot.params is required');
    }
}

function resolveDefaultState(snapshot) {
    const defaultState = snapshot.defaultState ?? null;
    if (!defaultState || !snapshot.states?.[defaultState]) {
        throw new Error('Fork publication requires a valid defaultState');
    }
    return defaultState;
}

function resolveSnapshotHash(states, defaultState, explicitSnapshotHash = null) {
    const timeline = normalizeTimeline(deepClone(states[defaultState]));
    const derivedSnapshotHash = hashTimeline(timeline);

    if (explicitSnapshotHash && explicitSnapshotHash !== derivedSnapshotHash) {
        throw new Error('Fork snapshotHash does not match the provided defaultState timeline');
    }

    return {
        snapshotHash: derivedSnapshotHash,
        timeline,
    };
}

function computeCapabilityProfile(timeline) {
    const controller = createTimelineController(timeline);
    return computeCapabilityIndex(controller);
}

function withRegistryCertification(seed, engineVersion) {
    return {
        ...seed,
        certification: registerTemplateCertification({
            certification: seed.certification,
            engineVersion,
        }),
    };
}

export function buildTemplateForkSeed({
    parentVersionId,
    snapshot,
    engineVersion = null,
}) {
    if (typeof parentVersionId !== 'string' || parentVersionId.length === 0) {
        throw new Error('publishTemplateFork requires a parentVersionId');
    }

    assertSnapshot(snapshot);

    const parent = getByVersionId(parentVersionId);
    if (!parent) {
        throw new Error(`Unknown fork parent version: ${parentVersionId}`);
    }

    const states = deepClone(snapshot.states);
    const defaultState = resolveDefaultState({ ...snapshot, states });
    const { snapshotHash, timeline } = resolveSnapshotHash(
        states,
        defaultState,
        snapshot.snapshotHash ?? null,
    );
    const resolvedEngineVersion =
        engineVersion ??
        snapshot?.metadata?.engine ??
        parent?.certification?.engineVersion ??
        parent?.metadata?.engine ??
        'dropple-motion@1.x';
    const metadata = {
        ...deepClone(parent.metadata ?? {}),
        ...deepClone(snapshot.metadata ?? {}),
        engine: resolvedEngineVersion,
    };

    const seed = createTemplateSeed({
        id: snapshot.id ?? parent.id,
        version: snapshot.version,
        snapshotHash,
        baseSceneGraph: deepClone(snapshot.baseSceneGraph),
        states,
        defaultState,
        capabilityProfile: snapshot.capabilityProfile ?? computeCapabilityProfile(timeline),
        metadata,
        params: deepClone(snapshot.params),
        contentHashInputs: snapshot.contentHashInputs,
        lineage: {
            type: 'fork',
            rootId: parent.lineageRootId ?? parent.lineage?.rootId,
            parentIds: [parentVersionId],
        },
    });

    if (seed.lineage.nodeId === parentVersionId) {
        throw new Error('Invalid fork: self-parenting detected');
    }

    return {
        parent,
        seed,
        engineVersion: resolvedEngineVersion,
    };
}

export function publishTemplateFork({
    parentVersionId,
    snapshot,
    engineVersion = null,
    publicKey = null,
}) {
    const { parent, seed, engineVersion: resolvedEngineVersion } = buildTemplateForkSeed({
        parentVersionId,
        snapshot,
        engineVersion,
    });
    const certifiedSeed = withRegistryCertification(
        certifyTemplateSeed(seed),
        resolvedEngineVersion,
    );
    const registration = registerCertifiedTemplate({
        template: certifiedSeed,
        engineVersion: resolvedEngineVersion,
        publicKey,
    });

    return {
        parentVersionId,
        parent,
        seed: certifiedSeed,
        registration: {
            ...registration,
            engineHash: hashEngineVersion(resolvedEngineVersion),
        },
    };
}
