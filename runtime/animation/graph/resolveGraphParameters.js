function toSafeNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    const coerced = Number(value);
    return Number.isFinite(coerced) ? coerced : 0;
}

function normalizeValue(definition, value) {
    if (!definition) {
        return toSafeNumber(value);
    }

    switch (definition.type) {
        case 'boolean':
            return value ? 1 : 0;
        case 'number': {
            let next = toSafeNumber(value);

            if (definition.min !== undefined) {
                next = Math.max(toSafeNumber(definition.min), next);
            }

            if (definition.max !== undefined) {
                next = Math.min(toSafeNumber(definition.max), next);
            }

            return next;
        }
        default:
            return toSafeNumber(value);
    }
}

export function resolveGraphParameters({
    graph = null,
    injected = {},
} = {}) {
    const result = Object.create(null);
    const definitions =
        graph?.parameters && typeof graph.parameters === 'object' ? graph.parameters : {};
    const keys = new Set([
        ...Object.keys(definitions),
        ...Object.keys(injected || {}),
    ]);

    for (const key of Array.from(keys).sort()) {
        const definition = definitions[key];
        const injectedValue = injected?.[key];

        if (injectedValue !== undefined) {
            result[key] = normalizeValue(definition, injectedValue);
            continue;
        }

        if (definition && definition.default !== undefined) {
            result[key] = normalizeValue(definition, definition.default);
            continue;
        }

        result[key] = 0;
    }

    return result;
}
