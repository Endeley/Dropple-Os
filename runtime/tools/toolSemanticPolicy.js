import { allowsExecutionSignatureMajorMigration } from '@/runtime/tools/resolveToolExecutionSignatureMigration.js';

function normalizeNumber(value) {
    return Number.isFinite(value) ? value : 0;
}

export const TOOL_SEMANTIC_FIELD_GOVERNANCE = Object.freeze({
    label: 'winner-owned',
    defaultActive: 'winner-owned',
    intentTopics: 'mergeable',
    capabilityTags: 'mergeable',
    handlerFamily: 'constitutionally-invalid-on-conflict',
    handlerPayload: 'constitutionally-invalid-on-conflict',
    executionSignature: 'constitutionally-invalid-on-conflict',
    group: 'constitutionally-invalid-on-conflict',
});

export const WINNER_OWNED_TOOL_DESCRIPTOR_FIELDS = Object.freeze(
    Object.entries(TOOL_SEMANTIC_FIELD_GOVERNANCE)
        .filter(([, governance]) => governance === 'winner-owned')
        .map(([field]) => field)
        .sort((left, right) => left.localeCompare(right)),
);

export const MERGEABLE_TOOL_DESCRIPTOR_FIELDS = Object.freeze(
    Object.entries(TOOL_SEMANTIC_FIELD_GOVERNANCE)
        .filter(([, governance]) => governance === 'mergeable')
        .map(([field]) => field)
        .sort((left, right) => left.localeCompare(right)),
);

export const INVALIDATING_TOOL_DESCRIPTOR_FIELDS = Object.freeze(
    Object.entries(TOOL_SEMANTIC_FIELD_GOVERNANCE)
        .filter(([, governance]) => governance === 'constitutionally-invalid-on-conflict')
        .map(([field]) => field)
        .sort((left, right) => left.localeCompare(right)),
);

function stableStringify(value) {
    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
    }

    if (value && typeof value === 'object') {
        return `{${Object.keys(value)
            .sort((left, right) => left.localeCompare(right))
            .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function parseSchemaVersion(value) {
    if (typeof value !== 'string') return { major: 1, minor: 0 };
    const [majorRaw, minorRaw] = value.trim().split('.');
    const major = Number.parseInt(majorRaw, 10);
    const minor = Number.parseInt(minorRaw ?? '0', 10);
    return {
        major: Number.isFinite(major) && major >= 0 ? major : 1,
        minor: Number.isFinite(minor) && minor >= 0 ? minor : 0,
    };
}

function normalizeExecutionSignature(signature) {
    const normalized = signature && typeof signature === 'object' ? signature : {};
    const version = parseSchemaVersion(normalized.schemaVersion);
    return Object.freeze({
        schemaVersion: `${version.major}.${version.minor}`,
        major: version.major,
        minor: version.minor,
        executionMode: typeof normalized.executionMode === 'string' ? normalized.executionMode : '',
        intentKind: typeof normalized.intentKind === 'string' ? normalized.intentKind : '',
        nodeType: typeof normalized.nodeType === 'string' ? normalized.nodeType : '',
        sessionType: typeof normalized.sessionType === 'string' ? normalized.sessionType : '',
    });
}

function signatureCoreKey(signature) {
    return stableStringify({
        executionMode: signature.executionMode,
        intentKind: signature.intentKind,
        nodeType: signature.nodeType,
        sessionType: signature.sessionType,
    });
}

export function normalizeToolSemanticPriority(value) {
    return normalizeNumber(value);
}

export function resolveToolSemanticFieldGovernance(field) {
    return TOOL_SEMANTIC_FIELD_GOVERNANCE[field] ?? null;
}

export function compareToolSemanticPrecedence(leftSource, rightSource, sourcePriority) {
    const leftPriority = normalizeToolSemanticPriority(sourcePriority?.[leftSource]);
    const rightPriority = normalizeToolSemanticPriority(sourcePriority?.[rightSource]);

    if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
    }

    return String(leftSource).localeCompare(String(rightSource));
}

export function normalizeToolOwnerIds(owners) {
    if (!Array.isArray(owners)) return Object.freeze([]);

    return Object.freeze(
        Array.from(
            new Set(
                owners
                    .filter((owner) => typeof owner === 'string')
                    .map((owner) => owner.trim())
                    .filter(Boolean),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function getDistinctHandlerFamilies(entries) {
    return Object.freeze(
        Array.from(
            new Set(
                (Array.isArray(entries) ? entries : [])
                    .map((entry) => entry?.descriptor?.handlerFamily ?? null)
                    .filter((handlerFamily) => typeof handlerFamily === 'string' && handlerFamily.length > 0),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function getDistinctHandlerPayloads(entries) {
    return Object.freeze(
        Array.from(
            new Set(
                (Array.isArray(entries) ? entries : [])
                    .map((entry) => entry?.descriptor?.handlerPayload ?? null)
                    .map((handlerPayload) => stableStringify(handlerPayload)),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function getDistinctExecutionSignatures(entries) {
    return Object.freeze(
        Array.from(
            new Set(
                (Array.isArray(entries) ? entries : [])
                    .map((entry) => entry?.descriptor?.executionSignature ?? null)
                    .map((executionSignature) => stableStringify(executionSignature)),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function resolveExecutionSignatureCompatibility(entries, { toolId } = {}) {
    const signatures = (Array.isArray(entries) ? entries : [])
        .map((entry) => normalizeExecutionSignature(entry?.descriptor?.executionSignature))
        .sort((left, right) => {
            if (left.major !== right.major) return left.major - right.major;
            if (left.minor !== right.minor) return left.minor - right.minor;
            return signatureCoreKey(left).localeCompare(signatureCoreKey(right));
        });

    if (!signatures.length) return Object.freeze({ compatible: true });

    const majorVersions = Array.from(new Set(signatures.map((s) => s.major))).sort((a, b) => a - b);
    if (majorVersions.length > 1) {
        const coreKeys = Array.from(new Set(signatures.map((s) => signatureCoreKey(s)))).sort((a, b) => a.localeCompare(b));
        if (
            allowsExecutionSignatureMajorMigration({
                toolId,
                majorVersions,
                coreKeyCount: coreKeys.length,
            })
        ) {
            return Object.freeze({
                compatible: true,
                migration: Object.freeze({
                    kind: 'major-window',
                    toolId,
                    majorVersions: Object.freeze(majorVersions),
                }),
            });
        }

        return Object.freeze({
            compatible: false,
            code: 'execution-signature-version-conflict',
            message: `Projected tool identity has incompatible execution signature major versions: ${majorVersions.join(', ')}`,
            majorVersions: Object.freeze(majorVersions),
        });
    }

    const coreKeys = Array.from(new Set(signatures.map((s) => signatureCoreKey(s)))).sort((a, b) => a.localeCompare(b));
    if (coreKeys.length > 1) {
        return Object.freeze({
            compatible: false,
            code: 'execution-signature-conflict',
            message: 'Projected tool identity has incompatible execution contract semantics',
            executionSignatures: Object.freeze(signatures.map((signature) => stableStringify(signature))),
        });
    }

    return Object.freeze({ compatible: true });
}

export function getDistinctDescriptorValues(entries, field) {
    return Object.freeze(
        Array.from(
            new Set(
                (Array.isArray(entries) ? entries : [])
                    .map((entry) => entry?.descriptor?.[field] ?? null)
                    .filter((value) => value !== null && value !== undefined),
            ),
        ).sort((left, right) => String(left).localeCompare(String(right))),
    );
}

export function normalizeMergedStringArray(values) {
    if (!Array.isArray(values)) return Object.freeze([]);

    return Object.freeze(
        Array.from(
            new Set(
                values
                    .filter((value) => typeof value === 'string')
                    .map((value) => value.trim())
                    .filter(Boolean),
            ),
        ).sort((left, right) => left.localeCompare(right)),
    );
}

export function resolveToolSemanticConflict(entries, { toolId } = {}) {
    const handlerFamilies = getDistinctHandlerFamilies(entries);

    if (handlerFamilies.length > 1) {
        return Object.freeze({
            code: 'handler-family-conflict',
            message: `Projected tool identity has incompatible handler families: ${handlerFamilies.join(', ')}`,
            handlerFamilies,
        });
    }

    const handlerPayloads = getDistinctHandlerPayloads(entries);
    if (handlerPayloads.length > 1) {
        return Object.freeze({
            code: 'handler-payload-conflict',
            message: 'Projected tool identity has incompatible handler payload semantics',
            handlerPayloads,
        });
    }

    const executionSignatures = getDistinctExecutionSignatures(entries);
    if (executionSignatures.length > 1) {
        const compatibility = resolveExecutionSignatureCompatibility(entries, { toolId });
        if (!compatibility.compatible) {
            return Object.freeze({
                code: compatibility.code,
                message: compatibility.message,
                executionSignatures:
                    compatibility.executionSignatures ?? executionSignatures,
                majorVersions: compatibility.majorVersions ?? undefined,
            });
        }
    }

    const groups = getDistinctDescriptorValues(entries, 'group');
    if (groups.length > 1) {
        return Object.freeze({
            code: 'group-conflict',
            message: `Projected tool identity has incompatible structural group semantics: ${groups.join(', ')}`,
            groups,
        });
    }

    return null;
}
