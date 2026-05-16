import { EventTypes } from '@/core/events/eventTypes.js';
import {
    GOVERNANCE_ACCEPT_CODES,
    GOVERNANCE_ACCEPT_REASONS,
    GOVERNANCE_REJECT_CODES,
    GOVERNANCE_REJECT_REASONS,
    normalizeToolGovernanceIds,
} from '@/runtime/tools/toolGovernanceTelemetry.js';

const GOVERNANCE_TYPES = Object.freeze(new Set([
    'runtime.tools.governance.accept',
    'runtime.tools.governance.reject',
]));

const GOVERNANCE_PAYLOAD_KEYS = Object.freeze([
    'atEventType',
    'code',
    'reason',
    'source',
    'toolIds',
]);

const ALLOWED_EVENT_TYPES = Object.freeze(new Set([
    EventTypes.TOOLS_REGISTER,
    'capability.tools.register.requested',
]));

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function hasCanonicalPayloadKeys(payload) {
    const keys = Object.keys(payload ?? {}).sort((left, right) => left.localeCompare(right));
    return JSON.stringify(keys) === JSON.stringify(GOVERNANCE_PAYLOAD_KEYS);
}

export function attestToolGovernanceAudit(auditEntries = []) {
    const violations = [];
    const entries = Array.isArray(auditEntries) ? auditEntries : [];

    entries.forEach((entry, index) => {
        if (!GOVERNANCE_TYPES.has(entry?.type)) return;
        const payload = entry?.payload;

        if (!payload || typeof payload !== 'object') {
            violations.push({ index, code: 'governance-payload-missing' });
            return;
        }

        if (!hasCanonicalPayloadKeys(payload)) {
            violations.push({ index, code: 'governance-payload-schema-invalid' });
            return;
        }

        if (!ALLOWED_EVENT_TYPES.has(payload.atEventType)) {
            violations.push({ index, code: 'governance-atEventType-invalid' });
        }

        if (!Array.isArray(payload.toolIds)) {
            violations.push({ index, code: 'governance-toolIds-invalid' });
        } else {
            const normalized = normalizeToolGovernanceIds(payload.toolIds);
            if (JSON.stringify(payload.toolIds) !== JSON.stringify(normalized)) {
                violations.push({ index, code: 'governance-toolIds-noncanonical' });
            }
        }

        if (entry.type === 'runtime.tools.governance.accept') {
            if (!GOVERNANCE_ACCEPT_CODES.includes(payload.code)) {
                violations.push({ index, code: 'governance-accept-code-invalid' });
            }
            if (!GOVERNANCE_ACCEPT_REASONS.includes(payload.reason)) {
                violations.push({ index, code: 'governance-accept-reason-invalid' });
            }
            if (!isNonEmptyString(payload.source)) {
                violations.push({ index, code: 'governance-source-invalid' });
            }
        } else {
            if (!GOVERNANCE_REJECT_CODES.includes(payload.code)) {
                violations.push({ index, code: 'governance-reject-code-invalid' });
            }
            if (!GOVERNANCE_REJECT_REASONS.includes(payload.reason)) {
                violations.push({ index, code: 'governance-reject-reason-invalid' });
            }
            if (payload.code !== 'tool-registration-source-invalid' && !isNonEmptyString(payload.source)) {
                violations.push({ index, code: 'governance-source-invalid' });
            }
        }
    });

    return Object.freeze({
        ok: violations.length === 0,
        violations: Object.freeze(violations.map((entry) => Object.freeze({ ...entry }))),
    });
}
