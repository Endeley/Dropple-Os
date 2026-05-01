import { normalizeParentVersionIds, isAncestorVersion } from '../core/events/tokenVersionGraph.js';
import { normalizeTimeline, hashTimeline } from '../domain/timeline/TimelineContract.js';
import { createTimelineController } from '../engine/timeline/timelineController.js';
import { computeCapabilityIndex } from '../engine/observability/capabilityIndex.js';
import { createTemplateSeed } from '../engine/templates/templateSeed.js';
import { certifyTemplateSeed } from '../engine/templates/certifyTemplateSeed.js';
import {
    getByVersionId,
    listLineageVersions,
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
        throw new Error('publishTemplateMerge requires a snapshot object');
    }
    if (typeof snapshot.version !== 'string' || snapshot.version.length === 0) {
        throw new Error('Merge publication snapshot.version is required');
    }
    if (!('baseSceneGraph' in snapshot)) {
        throw new Error('Merge publication snapshot.baseSceneGraph is required');
    }
    if (!('states' in snapshot)) {
        throw new Error('Merge publication snapshot.states is required');
    }
    if (!('defaultState' in snapshot)) {
        throw new Error('Merge publication snapshot.defaultState is required');
    }
    if (!('params' in snapshot)) {
        throw new Error('Merge publication snapshot.params is required');
    }
}

function resolveDefaultState(snapshot) {
    const defaultState = snapshot.defaultState ?? null;
    if (!defaultState || !snapshot.states?.[defaultState]) {
        throw new Error('Merge publication requires a valid defaultState');
    }
    return defaultState;
}

function resolveSnapshotHash(states, defaultState, explicitSnapshotHash = null) {
    const timeline = normalizeTimeline(deepClone(states[defaultState]));
    const derivedSnapshotHash = hashTimeline(timeline);

    if (explicitSnapshotHash && explicitSnapshotHash !== derivedSnapshotHash) {
        throw new Error('Merge snapshotHash does not match the provided defaultState timeline');
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

function resolveParents(parentVersionIds) {
    if (!Array.isArray(parentVersionIds) || parentVersionIds.length < 2) {
        throw new Error('publishTemplateMerge requires at least two parentVersionIds');
    }

    const stringParents = parentVersionIds.filter(
        (value) => typeof value === 'string' && value.length > 0,
    );
    if (stringParents.length !== parentVersionIds.length) {
        throw new Error('publishTemplateMerge parentVersionIds must be non-empty strings');
    }

    const normalizedParents = normalizeParentVersionIds(parentVersionIds);
    if (normalizedParents.length !== parentVersionIds.length) {
        throw new Error('Invalid merge: duplicate parentVersionIds detected');
    }

    const parents = normalizedParents.map((versionId) => {
        const parent = getByVersionId(versionId);
        if (!parent) {
            throw new Error(`Unknown merge parent version: ${versionId}`);
        }
        return parent;
    });

    const lineageRootId = parents[0].lineageRootId;
    for (const parent of parents) {
        if (parent.lineageRootId !== lineageRootId) {
            throw new Error('Invalid merge: all parents must share the same lineageRootId');
        }
    }

    const lineageEntries = listLineageVersions(lineageRootId);
    const graph = {
        entries: Object.fromEntries(
            lineageEntries.map((entry) => [
                entry.versionId,
                {
                    id: entry.versionId,
                    parentVersionIds: entry.parentVersionIds ?? [],
                },
            ]),
        ),
        order: lineageEntries.map((entry) => entry.versionId),
    };

    for (let index = 0; index < normalizedParents.length; index += 1) {
        for (let compareIndex = index + 1; compareIndex < normalizedParents.length; compareIndex += 1) {
            const left = normalizedParents[index];
            const right = normalizedParents[compareIndex];
            if (
                isAncestorVersion(graph, left, right) ||
                isAncestorVersion(graph, right, left)
            ) {
                throw new Error(
                    `Invalid merge: parent ancestry conflict detected between ${left} and ${right}`,
                );
            }
        }
    }

    return {
        normalizedParents,
        parents,
        lineageRootId,
    };
}

export function buildTemplateMergeSeed({
    parentVersionIds,
    snapshot,
    engineVersion = null,
}) {
    assertSnapshot(snapshot);

    const { normalizedParents, parents, lineageRootId } = resolveParents(parentVersionIds);
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
        parents[0]?.certification?.engineVersion ??
        parents[0]?.metadata?.engine ??
        'dropple-motion@1.x';
    const metadata = {
        ...deepClone(parents[0]?.metadata ?? {}),
        ...deepClone(snapshot.metadata ?? {}),
        engine: resolvedEngineVersion,
    };

    const seed = createTemplateSeed({
        id: snapshot.id ?? parents[0].id,
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
            type: 'merge',
            rootId: lineageRootId,
            parentIds: normalizedParents,
        },
    });

    if (normalizedParents.includes(seed.lineage.nodeId)) {
        throw new Error('Invalid merge: self-parenting detected');
    }

    return {
        parents,
        normalizedParents,
        seed,
        engineVersion: resolvedEngineVersion,
    };
}

export function publishTemplateMerge({
    parentVersionIds,
    snapshot,
    engineVersion = null,
    publicKey = null,
}) {
    const {
        parents,
        normalizedParents,
        seed,
        engineVersion: resolvedEngineVersion,
    } = buildTemplateMergeSeed({
        parentVersionIds,
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
        parentVersionIds: normalizedParents,
        parents,
        seed: certifiedSeed,
        registration: {
            ...registration,
            engineHash: hashEngineVersion(resolvedEngineVersion),
        },
    };
}
