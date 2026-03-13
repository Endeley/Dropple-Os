import { compileVariants } from './variantCompiler.js';

function inferTag(component = {}) {
    if (component.tag) return component.tag;
    if (component.name === 'Button') return 'button';
    if (component.name === 'Input') return 'input';
    return 'div';
}

export function compileComponent(component = {}, { tokens = {}, theme = {} } = {}) {
    const compiledVariants = compileVariants(component.variants || {}, {
        tokens,
        theme,
    });
    const variantNames = Object.keys(compiledVariants);

    return {
        name: component.name,
        tag: inferTag(component),
        slots: Array.isArray(component.slots) ? [...component.slots].sort() : [],
        variants: compiledVariants,
        defaultVariant:
            component.defaultVariant && compiledVariants[component.defaultVariant]
                ? component.defaultVariant
                : variantNames[0] || null,
    };
}

export function compileComponents(components = {}, options = {}) {
    return Object.fromEntries(
        Object.entries(components)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([name, component]) => [
                name,
                compileComponent(
                    {
                        name,
                        ...component,
                    },
                    options,
                ),
            ]),
    );
}

export function compileComponentsFromContext(context) {
    const system = context.ir?.designSystem || {};
    const themeName = Object.keys(context.themes || {})[0] || 'default';
    const theme = context.themes?.[themeName] || {};
    const compiled = compileComponents(system.components || {}, {
        tokens: context.designTokens || {},
        theme,
    });

    context.designComponents = compiled;
    return compiled;
}
