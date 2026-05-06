import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';
import { LOCAL_DOCUMENT_VERSION } from '@/core/persistence/localDocumentVersion.js';
import { initialRuntimeState } from '@/runtime/state/runtimeState.internal.js';
import { buildRuntimeSnapshotFromTemplateEnvironment } from '@/runtime/templates/activateResolvedTemplateEnvironment.js';
import { exportPNG } from './png/exportPNG.js';
import { exportSVG } from './svg/exportSVG.js';
import { exportDroppleSpec } from './exportDroppleSpec.js';
import { exportJSON } from './exportJSON.js';
import { getExportCapabilities } from './getExportCapabilities.js';
import {
    createExportFingerprint,
    EXPORT_CANONICAL_VERSION,
    EXPORT_HASH_ALGORITHM,
} from './exportFingerprint.js';

export const ArtifactExportModes = Object.freeze({
    REBUILD: 'rebuild',
    FINAL: 'final',
});

export const ArtifactExportKinds = Object.freeze({
    DROPPLE_SPEC: 'dropple-spec',
    JSON: 'json',
    SVG: 'svg',
    PNG: 'png',
});

export {
    EXPORT_CANONICAL_VERSION,
    EXPORT_HASH_ALGORITHM,
};

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertResolvedEnvironmentMatchesDescriptor({
    descriptor,
    resolvedEnvironment,
} = {}) {
    const resolvedDescriptor = resolvedEnvironment?.descriptor ?? null;
    if (!isPlainObject(resolvedDescriptor)) {
        throw new Error('Environment artifact export requires resolvedEnvironment.descriptor.');
    }

    const expectedEnvironmentId = descriptor?.environmentId ?? null;
    const resolvedEnvironmentId = resolvedDescriptor?.environmentId ?? null;
    if (expectedEnvironmentId !== resolvedEnvironmentId) {
        throw new Error(
            'Environment artifact export requires resolvedEnvironment.descriptor to match descriptor environmentId.',
        );
    }

    const expectedLineageRootId = descriptor?.lineage?.lineageRootId ?? null;
    const resolvedLineageRootId = resolvedDescriptor?.lineage?.lineageRootId ?? null;
    const expectedVersionId = descriptor?.lineage?.versionId ?? null;
    const resolvedVersionId = resolvedDescriptor?.lineage?.versionId ?? null;

    if (
        expectedLineageRootId !== resolvedLineageRootId ||
        expectedVersionId !== resolvedVersionId
    ) {
        throw new Error(
            'Environment artifact export requires resolvedEnvironment.descriptor lineage to match descriptor lineage.',
        );
    }
}

function assertArtifact(artifact) {
    if (!isPlainObject(artifact)) {
        throw new Error('exportArtifact requires an artifact.');
    }

    if (artifact.kind !== ArtifactKind.ENVIRONMENT && artifact.kind !== ArtifactKind.SNAPSHOT) {
        throw new Error(`exportArtifact received unsupported artifact kind: ${artifact.kind}`);
    }
}

function resolveArtifactExportMode(artifact) {
    switch (artifact.kind) {
        case ArtifactKind.ENVIRONMENT:
            return ArtifactExportModes.REBUILD;
        case ArtifactKind.SNAPSHOT:
            return ArtifactExportModes.FINAL;
        default:
            throw new Error(`Unsupported artifact kind: ${artifact.kind}`);
    }
}

function buildRuntimeSnapshotFromPersistenceSnapshot(snapshot) {
    const events = Array.isArray(snapshot?.events) ? snapshot.events : [];
    const maxIndex = events.length - 1;
    const cursorIndex = Math.max(
        -1,
        Math.min(maxIndex, Number.isFinite(snapshot?.cursorIndex) ? snapshot.cursorIndex : maxIndex),
    );
    const runtimeSnapshot =
        getDesignStateAtCursor({
            events,
            uptoIndex: cursorIndex,
        }) ?? initialRuntimeState;

    return {
        ...runtimeSnapshot,
        events,
        cursorIndex,
    };
}

function buildRuntimeSnapshotFromEnvironmentArtifact(artifact) {
    if (!isPlainObject(artifact?.descriptor)) {
        throw new Error('Environment artifact export requires descriptor.');
    }

    const resolved = artifact?.resolvedEnvironment ?? null;
    if (!isPlainObject(resolved)) {
        throw new Error('Environment artifact export requires resolvedEnvironment.');
    }

    if (!isPlainObject(resolved.template) || !isPlainObject(resolved.resolvedEnvironment)) {
        throw new Error(
            'Environment artifact export requires a resolvedEnvironment payload with template and resolvedEnvironment.',
        );
    }

    assertResolvedEnvironmentMatchesDescriptor({
        descriptor: artifact.descriptor,
        resolvedEnvironment: resolved,
    });

    return buildRuntimeSnapshotFromTemplateEnvironment({
        template: resolved.template,
        resolvedEnvironment: resolved.resolvedEnvironment,
        environmentId: artifact.descriptor.environmentId,
    });
}

function buildRuntimeSnapshotFromSnapshotArtifact(artifact) {
    const snapshot = artifact?.snapshot ?? null;
    if (!isPlainObject(snapshot)) {
        throw new Error('Snapshot artifact export requires snapshot.');
    }

    if (isPlainObject(snapshot.runtimeSnapshot)) {
        return snapshot.runtimeSnapshot;
    }

    if (isPlainObject(snapshot.document) || isPlainObject(snapshot.timeline) || isPlainObject(snapshot.workspace)) {
        return snapshot;
    }

    return buildRuntimeSnapshotFromPersistenceSnapshot(snapshot);
}

export function createArtifactPersistenceSnapshot({
    events = [],
    cursorIndex = -1,
    metadata = {},
} = {}) {
    return Object.freeze({
        version: LOCAL_DOCUMENT_VERSION,
        events: Array.isArray(events) ? events : [],
        cursorIndex: Number.isFinite(cursorIndex) ? cursorIndex : -1,
        metadata: isPlainObject(metadata) ? metadata : {},
    });
}

export function createSnapshotArtifact({
    snapshot,
} = {}) {
    if (!isPlainObject(snapshot)) {
        throw new Error('Snapshot export artifact requires snapshot.');
    }

    return Object.freeze({
        kind: ArtifactKind.SNAPSHOT,
        snapshot,
    });
}

export function createEnvironmentArtifact({
    descriptor,
    resolvedEnvironment,
} = {}) {
    if (!isPlainObject(descriptor)) {
        throw new Error('Environment export artifact requires descriptor.');
    }

    if (!isPlainObject(resolvedEnvironment)) {
        throw new Error('Environment export artifact requires resolvedEnvironment.');
    }

    assertResolvedEnvironmentMatchesDescriptor({
        descriptor,
        resolvedEnvironment,
    });

    return Object.freeze({
        kind: ArtifactKind.ENVIRONMENT,
        descriptor,
        resolvedEnvironment,
    });
}

export function buildRuntimeSnapshotFromArtifact(artifact) {
    assertArtifact(artifact);

    switch (artifact.kind) {
        case ArtifactKind.ENVIRONMENT:
            return buildRuntimeSnapshotFromEnvironmentArtifact(artifact);
        case ArtifactKind.SNAPSHOT:
            return buildRuntimeSnapshotFromSnapshotArtifact(artifact);
        default:
            throw new Error(`Unsupported artifact kind: ${artifact.kind}`);
    }
}

export function exportFromRuntimeSnapshot({
    snapshot,
    format = ArtifactExportKinds.DROPPLE_SPEC,
    options = {},
} = {}) {
    if (!isPlainObject(snapshot)) {
        throw new Error('exportFromRuntimeSnapshot requires snapshot.');
    }

    switch (format) {
        case ArtifactExportKinds.DROPPLE_SPEC:
            return exportDroppleSpec({
                snapshot,
                options,
            });
        case ArtifactExportKinds.JSON:
            return exportJSON({
                snapshot,
                ...options,
            });
        case ArtifactExportKinds.SVG:
            return exportSVG({
                snapshot,
                ...options,
            });
        case ArtifactExportKinds.PNG:
            return exportPNG({
                snapshot,
                ...options,
            });
        default:
            throw new Error(`Unsupported artifact export format: ${format}`);
    }
}

export async function exportArtifact({
    artifact,
    format = ArtifactExportKinds.DROPPLE_SPEC,
    options = {},
} = {}) {
    assertArtifact(artifact);
    const capabilities = getExportCapabilities(artifact);
    if (!capabilities.formats.includes(format)) {
        throw new Error(`Export format not allowed for artifact: ${format}`);
    }

    const snapshot = buildRuntimeSnapshotFromArtifact(artifact);
    const mode = resolveArtifactExportMode(artifact);
    const output = await exportFromRuntimeSnapshot({
        snapshot,
        format,
        options,
    });
    const { exportHash, algorithm, canonicalVersion } = await createExportFingerprint({
        output,
    });

    return Object.freeze({
        artifactKind: artifact.kind,
        exportMode: mode,
        format,
        exportHash,
        algorithm,
        canonicalVersion,
        output,
    });
}
