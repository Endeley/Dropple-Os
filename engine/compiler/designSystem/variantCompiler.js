function resolveValue(value, tokens = {}, theme = {}) {
    if (typeof value !== 'string' || !value.includes('.')) {
        return value;
    }

    const [root, ...rest] = value.split('.');
    if (!root || rest.length === 0) {
        return value;
    }

    const sources = [theme, tokens];
    for (const source of sources) {
        let current = source?.[root];
        for (const segment of rest) {
            current = current?.[segment];
        }
        if (current !== undefined) {
            return current;
        }
    }

    return value;
}

function normalizeVariantConfig(config = {}, tokens = {}, theme = {}) {
    return Object.fromEntries(
        Object.entries(config)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, value]) => [key, resolveValue(value, tokens, theme)]),
    );
}

export function compileVariants(variants = {}, { tokens = {}, theme = {} } = {}) {
    return Object.fromEntries(
        Object.entries(variants)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([name, config]) => [
                name,
                normalizeVariantConfig(config, tokens, theme),
            ]),
    );
}

export function compileVariantsFromContext(context) {
    const variants = {};

    for (const [name, component] of Object.entries(context.designComponents || {})) {
        variants[name] = Object.keys(component.variants || {}).sort();
    }

    context.designVariants = variants;
    return variants;
}
