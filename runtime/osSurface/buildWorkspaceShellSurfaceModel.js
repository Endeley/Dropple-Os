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

export function buildWorkspaceShellSurfaceModel(snapshot = {}) {
    const environment = snapshot?.environment ?? {};
    const assistants = snapshot?.assistants ?? {};
    const synthesizedTools = snapshot?.synthesizedTools ?? {};
    const toolList = Array.isArray(synthesizedTools.tools) ? synthesizedTools.tools : [];

    return Object.freeze({
        workspaceId: normalizeString(environment.workspaceId),
        modeId: normalizeString(environment.modeId),
        environmentId: normalizeString(environment.activeEnvironmentId),
        sessionId: normalizeString(environment.activeSessionId),
        overlays: normalizeStringArray(environment.capabilityOverlays),
        participantIds: normalizeStringArray(environment?.federation?.participantIds),
        federationPhase: normalizeString(environment?.federation?.sessionPhase),
        releaseTrustHash: normalizeString(environment?.trustEnvelope?.releaseTrustHash),
        perspectiveId: normalizeString(assistants?.perspectiveId),
        activeAssistantId: normalizeString(assistants?.activeAssistantId),
        visibleAssistantIds: normalizeStringArray(assistants?.assistantIds),
        activeToolId: normalizeString(synthesizedTools.activeToolId),
        visibleToolIds: normalizeStringArray(toolList.map((tool) => tool?.toolId)),
    });
}
