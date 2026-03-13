export function compileDataSources(context) {
    const sources = Array.isArray(context.ir?.dataSources)
        ? context.ir.dataSources
        : [];

    const normalized = sources
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id))
        .map(normalizeSource);

    context.application.dataSources = normalized;

    return normalized;
}

function normalizeSource(source) {
    return {
        id: source.id,
        type: source.type || 'rest',
        url: source.url || null,
        method: (source.method || 'GET').toUpperCase(),
        params: normalizeParams(source.params || {}),
    };
}

function normalizeParams(params) {
    return Object.fromEntries(
        Object.entries(params).sort(([left], [right]) => left.localeCompare(right)),
    );
}
