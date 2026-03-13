function sortObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, nested]) => [
                key,
                nested && typeof nested === 'object' && !Array.isArray(nested)
                    ? sortObject(nested)
                    : nested,
            ]),
    );
}

export function compileTokens(tokens = {}) {
    return sortObject(tokens);
}

export function compileTokensFromContext(context) {
    const system = context.ir?.designSystem || {};
    const rawTokens = system.tokens || {
        colors: system.colors,
        spacing: system.spacing,
        typography: system.typography,
        shadows: system.shadows,
        radii: system.radii,
    };

    const compiled = compileTokens(rawTokens);
    context.designTokens = compiled;
    return compiled;
}
