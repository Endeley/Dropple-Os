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

export function resolveToolSemanticConflict(entries) {
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
