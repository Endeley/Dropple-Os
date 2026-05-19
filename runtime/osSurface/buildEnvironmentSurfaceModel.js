function normalizeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(values) {
    if (!Array.isArray(values)) return Object.freeze([]);
    return Object.freeze(
        Array.from(
            new Set(
                values
                    .map((value) => normalizeString(value))
                    .filter(Boolean),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

function sortObjectKeys(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return Object.freeze({});
    return Object.freeze(
        Object.fromEntries(
            Object.entries(value)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, item]) => [key, item]),
        ),
    );
}

export function buildEnvironmentSurfaceModel(input = {}) {
    const runtime = input?.runtime ?? {};
    const workspace = input?.workspace ?? {};
    const federation = input?.federation ?? {};
    const trust = input?.trust ?? {};

    return Object.freeze({
        activeEnvironmentId: normalizeString(runtime.activeEnvironmentId),
        activeSessionId: normalizeString(runtime.activeSessionId),
        workspaceId: normalizeString(workspace.workspaceId),
        modeId: normalizeString(workspace.modeId),
        capabilityOverlays: normalizeStringArray(workspace.capabilityOverlays),
        federation: Object.freeze({
            participantIds: normalizeStringArray(federation.participantIds),
            sessionPhase: normalizeString(federation.sessionPhase),
            lineageHash: normalizeString(federation.lineageHash),
            attestationHash: normalizeString(federation.attestationHash),
        }),
        trustEnvelope: Object.freeze({
            releaseTrustHash: normalizeString(trust.releaseTrustHash),
            federationLineageLedgerHead: normalizeString(trust.federationLineageLedgerHead),
        }),
        executionTopology: sortObjectKeys(runtime.executionTopology),
    });
}
