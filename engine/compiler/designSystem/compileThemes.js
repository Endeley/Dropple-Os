export function compileThemes(context) {
    const tokens = cloneTokens(context.designTokens || {});

    context.themes = {
        light: tokens,
        dark: generateDarkTheme(tokens),
    };

    return context.themes;
}

function generateDarkTheme(tokens) {
    const dark = cloneTokens(tokens);

    if (dark.colors?.background) {
        dark.colors.background = '#111';
    }

    if (dark.colors?.text) {
        dark.colors.text = dark.colors.text === '#111' ? '#f5f5f5' : dark.colors.text;
    }

    return dark;
}

function cloneTokens(tokens) {
    return {
        colors: { ...(tokens.colors || {}) },
        spacing: { ...(tokens.spacing || {}) },
        typography: { ...(tokens.typography || {}) },
        shadows: { ...(tokens.shadows || {}) },
        radii: { ...(tokens.radii || {}) },
    };
}
