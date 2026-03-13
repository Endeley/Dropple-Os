export function compileState(context) {
    const state = context.ir?.state || {};
    const normalized = sortObjectDeep(state);

    context.application.state = normalized;
    context.state = normalized;

    return normalized;
}

function sortObjectDeep(value) {
    if (Array.isArray(value)) {
        return value.map(sortObjectDeep);
    }

    if (value && typeof value === 'object') {
        const out = {};
        for (const key of Object.keys(value).sort()) {
            out[key] = sortObjectDeep(value[key]);
        }
        return out;
    }

    return value;
}
