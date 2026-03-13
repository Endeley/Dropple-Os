import { compileTokens } from './tokenCompiler.js';
import { compileTheme, compileThemes } from './themeCompiler.js';
import { compileComponent, compileComponents } from './componentCompiler.js';
import { generateCssVariables } from './cssVariableGenerator.js';
import { generateLibrary } from './libraryGenerator.js';

function toCssName(name) {
    return String(name)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase();
}

function buildThemeVariables(theme, selector) {
    const entries = Object.entries(theme || {}).sort(([left], [right]) =>
        left.localeCompare(right),
    );

    if (entries.length === 0) {
        return `${selector} {}\n`;
    }

    const body = entries
        .map(([key, value]) => `  --${toCssName(key)}: ${value};`)
        .join('\n');

    return `${selector} {\n${body}\n}\n`;
}

function buildThemeCss(themes) {
    const entries = Object.entries(themes || {});
    if (entries.length === 0) {
        return ':root {}\n';
    }

    return entries
        .map(([name, theme], index) => {
            if (index === 0) {
                return buildThemeVariables(theme, ':root');
            }
            return buildThemeVariables(theme, `[data-theme="${name}"]`);
        })
        .join('\n');
}

export function buildReactDesignSystem(input = {}) {
    const tokens = compileTokens(input.tokens || {});
    const themes =
        input.themes && Object.keys(input.themes).length > 0
            ? compileThemes(input.themes, tokens)
            : input.theme
              ? { default: compileTheme(input.theme, tokens) }
              : compileThemes({}, tokens);

    const themeName = Object.keys(themes)[0] || 'default';
    const compiledComponents = Array.isArray(input.components)
        ? Object.fromEntries(
              input.components.map((component) => [
                  component.name,
                  compileComponent(component, {
                      tokens,
                      theme: themes[themeName] || {},
                  }),
              ]),
          )
        : compileComponents(input.components || {}, {
              tokens,
              theme: themes[themeName] || {},
          });

    const library = generateLibrary(compiledComponents, {
        tokens,
        themes,
        packageName:
            input.packageName ||
            `@dropple/${input.workspace || 'design-system'}`,
    });

    return {
        tokens,
        themes,
        components: compiledComponents,
        library: {
            ...library,
            'design-system/react/theme.css': `${generateCssVariables(tokens, ':root')}\n${buildThemeCss(themes)}`,
            'design-system/tokens/tokens.json': JSON.stringify(
                {
                    tokens,
                    themes,
                    components: compiledComponents,
                },
                null,
                2,
            ),
        },
    };
}
