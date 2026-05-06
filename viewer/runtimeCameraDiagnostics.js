import { buildRuntimeSnapshotFromArtifact } from '@/runtime/export/exportArtifact.js';
import { buildTemporalContext } from '@/runtime/temporal/buildTemporalContext.js';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function resolveViewerRuntimeCamera(artifact) {
    if (!isPlainObject(artifact)) return null;

    const runtimeSnapshot = buildRuntimeSnapshotFromArtifact(artifact);
    const temporalContext = buildTemporalContext({
        document: runtimeSnapshot?.document ?? null,
        runtime: runtimeSnapshot ?? null,
        cursorIndex: runtimeSnapshot?.cursorIndex ?? null,
    });

    return temporalContext?.camera ?? null;
}
