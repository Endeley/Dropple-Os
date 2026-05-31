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

export function buildAssistantSurfaceModel(input = {}) {
    return Object.freeze({
        perspectiveId: normalizeString(input.perspectiveId),
        adapterId: normalizeString(input.adapterId),
        adapterLabel: normalizeString(input.adapterLabel),
        activeAssistantId: normalizeString(input.activeAssistantId),
        assistantIds: normalizeStringArray(input.assistantIds),
    });
}
