export function compileDesignComponents(context) {
    const components = context.ir?.designSystem?.components || {};
    const compiled = {};

    for (const name of Object.keys(components).sort()) {
        const config = components[name] || {};

        compiled[name] = {
            variants: sortEntries(config.variants),
            slots: Array.isArray(config.slots) ? [...config.slots].sort() : [],
        };
    }

    context.designComponents = compiled;

    return compiled;
}

function sortEntries(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
    );
}
