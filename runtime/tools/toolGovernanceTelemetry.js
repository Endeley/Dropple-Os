function normalizeSource(source) {
    return typeof source === 'string' ? source.trim() : '';
}

const GOVERNANCE_REJECT_CODES = Object.freeze([
    'tool-registration-source-invalid',
    'tool-registration-descriptor-invalid',
    'tool-registration-descriptor-authority-leak',
    'tool-registration-handler-family-invalid',
    'tool-registration-recursive-sovereignty-blocked',
]);

const GOVERNANCE_ACCEPT_CODES = Object.freeze([
    'tool-registration-approved',
]);

const GOVERNANCE_REJECT_REASONS = Object.freeze([
    'tool-registration-source-invalid',
    'tool-registration-descriptor-invalid',
    'tool-registration-descriptor-authority-leak',
    'tool-registration-handler-family-invalid',
    'tool-registration-recursive-sovereignty-blocked',
]);

const GOVERNANCE_ACCEPT_REASONS = Object.freeze([
    'capability-boundary-governance-approved',
    'dispatcher-ingress-governance-approved',
    'tool-registration-governance-approved',
]);

function normalizeGovernanceCode(code, allowedCodes, fallbackCode) {
    const normalized = typeof code === 'string' ? code.trim() : '';
    return allowedCodes.includes(normalized) ? normalized : fallbackCode;
}

function normalizeGovernanceReason(reason, allowedReasons, fallbackReason) {
    const normalized = typeof reason === 'string' ? reason.trim() : '';
    return allowedReasons.includes(normalized) ? normalized : fallbackReason;
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
    const normalizedCode = normalizeGovernanceCode(
        code,
        GOVERNANCE_REJECT_CODES,
        'tool-registration-recursive-sovereignty-blocked',
    );
    const normalizedEventType = typeof atEventType === 'string' ? atEventType : 'unknown';
    const normalizedReason = normalizeGovernanceReason(
        reason,
        GOVERNANCE_REJECT_REASONS,
        normalizedCode,
    );
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
    const normalizedCode = normalizeGovernanceCode(
        code,
        GOVERNANCE_ACCEPT_CODES,
        'tool-registration-approved',
    );
    const normalizedEventType = typeof atEventType === 'string' ? atEventType : 'unknown';
    const normalizedReason = normalizeGovernanceReason(
        reason,
        GOVERNANCE_ACCEPT_REASONS,
        'tool-registration-governance-approved',
    );
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
