function normalizeNumber(value) {
    return Number.isFinite(value) ? value : 0;
}

export function normalizeToolSemanticPriority(value) {
    return normalizeNumber(value);
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

export function resolveToolSemanticConflict(entries) {
    const handlerFamilies = getDistinctHandlerFamilies(entries);

    if (handlerFamilies.length > 1) {
        return Object.freeze({
            code: 'handler-family-conflict',
            message: `Projected tool identity has incompatible handler families: ${handlerFamilies.join(', ')}`,
            handlerFamilies,
        });
    }

    return null;
}
