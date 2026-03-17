export function validateGraphParameters(graph) {
    if (!graph || typeof graph !== 'object') return;

    const parameters = graph?.parameters;
    if (!parameters) return;

    for (const key of Object.keys(parameters)) {
        const definition = parameters[key];

        if (!definition || typeof definition !== 'object') {
            throw new Error(`Invalid parameter definition for "${key}"`);
        }

        if (!definition.type) {
            throw new Error(`Parameter "${key}" missing type`);
        }

        if (definition.type !== 'number' && definition.type !== 'boolean') {
            throw new Error(`Parameter "${key}" has unsupported type "${definition.type}"`);
        }

        if (definition.type !== 'number') {
            continue;
        }

        if (definition.min !== undefined && !Number.isFinite(definition.min)) {
            throw new Error(`Parameter "${key}" min must be a number`);
        }

        if (definition.max !== undefined && !Number.isFinite(definition.max)) {
            throw new Error(`Parameter "${key}" max must be a number`);
        }

        if (
            definition.min !== undefined &&
            definition.max !== undefined &&
            definition.min > definition.max
        ) {
            throw new Error(`Parameter "${key}" has invalid range (min > max)`);
        }
    }
}
