function resolveReference(value, tokens = {}) {
    if (typeof value !== 'string' || !value.includes('.')) {
        return value;
    }

    const [group, ...rest] = value.split('.');
    if (!group || rest.length === 0) {
        return value;
    }

    let current = tokens[group];
    for (const segment of rest) {
        current = current?.[segment];
    }

    return current ?? value;
}

function compileThemeObject(theme = {}, tokens = {}) {
    return Object.fromEntries(
        Object.entries(theme)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, value]) => [key, resolveReference(value, tokens)]),
    );
}

export function compileTheme(theme = {}, tokens = {}) {
    return compileThemeObject(theme, tokens);
}

export function compileThemes(themes = {}, tokens = {}) {
    const entries = Object.entries(themes);
    if (entries.length === 0) {
        return {
            light: { ...tokens },
            dark: {
                ...tokens,
                color: {
                    ...(tokens.color || {}),
                },
                colors: {
                    ...(tokens.colors || {}),
                },
            },
        };
    }

    return Object.fromEntries(
        entries.map(([name, theme]) => [name, compileThemeObject(theme, tokens)]),
    );
}

export function compileThemesFromContext(context) {
    const system = context.ir?.designSystem || {};
    const tokens = context.designTokens || {};
    const sourceThemes =
        system.themes ||
        (system.theme ? { default: system.theme } : {});

    const compiled = compileThemes(sourceThemes, tokens);
    context.themes = compiled;
    return compiled;
}
