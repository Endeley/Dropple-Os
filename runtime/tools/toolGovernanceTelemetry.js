function normalizeSource(source) {
    return typeof source === 'string' ? source.trim() : '';
}

function normalizeToolIds(toolIds) {
    if (!Array.isArray(toolIds)) return Object.freeze([]);
    return Object.freeze(
        Array.from(
            new Set(
                toolIds
                    .filter((toolId) => typeof toolId === 'string')
                    .map((toolId) => toolId.trim())
                    .filter(Boolean),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function createToolGovernanceRejectTelemetry({
    code,
    source,
    toolIds,
    atEventType,
    reason,
    currentTimeMs,
} = {}) {
    const normalizedSource = normalizeSource(source);
    const normalizedToolIds = normalizeToolIds(toolIds);
    const normalizedCode = typeof code === 'string' ? code : 'tool-governance-reject';
    const normalizedEventType = typeof atEventType === 'string' ? atEventType : 'unknown';
    const normalizedReason = typeof reason === 'string' ? reason : '';
    const normalizedTimestamp = Number.isFinite(currentTimeMs) ? Number(currentTimeMs) : 0;

    return Object.freeze({
        type: 'runtime.tools.governance.reject',
        level: 'warning',
        timestamp: normalizedTimestamp,
        message: normalizedReason,
        payload: Object.freeze({
            code: normalizedCode,
            source: normalizedSource,
            toolIds: normalizedToolIds,
            atEventType: normalizedEventType,
            reason: normalizedReason,
        }),
    });
}

export function createToolGovernanceAcceptTelemetry({
    code,
    source,
    toolIds,
    atEventType,
    reason,
    currentTimeMs,
} = {}) {
    const normalizedSource = normalizeSource(source);
    const normalizedToolIds = normalizeToolIds(toolIds);
    const normalizedCode = typeof code === 'string' ? code : 'tool-registration-approved';
    const normalizedEventType = typeof atEventType === 'string' ? atEventType : 'unknown';
    const normalizedReason = typeof reason === 'string' ? reason : 'tool-registration-governance-approved';
    const normalizedTimestamp = Number.isFinite(currentTimeMs) ? Number(currentTimeMs) : 0;

    return Object.freeze({
        type: 'runtime.tools.governance.accept',
        level: 'info',
        timestamp: normalizedTimestamp,
        message: normalizedReason,
        payload: Object.freeze({
            code: normalizedCode,
            source: normalizedSource,
            toolIds: normalizedToolIds,
            atEventType: normalizedEventType,
            reason: normalizedReason,
        }),
    });
}
