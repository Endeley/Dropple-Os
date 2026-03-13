export function compileDesignTokens(context) {
    const system = context.ir?.designSystem || {};

    context.designTokens = {
        colors: sortEntries(system.colors),
        spacing: sortEntries(system.spacing),
        typography: sortEntries(system.typography),
        shadows: sortEntries(system.shadows),
        radii: sortEntries(system.radii),
    };

    return context.designTokens;
}

function sortEntries(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
    );
}
