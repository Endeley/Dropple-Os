export function compileInteractions(context) {
    const interactions = Array.isArray(context.ir?.interactions)
        ? context.ir.interactions
        : [];

    const compiled = interactions
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((interaction) => ({
            id: interaction.id,
            sourceNodeId: interaction.sourceNodeId,
            event: interaction.event,
            action: normalizeAction(interaction.action),
        }));

    context.application.interactions = compiled;
    context.interactions = compiled;

    return compiled;
}

function normalizeAction(action) {
    if (!action || typeof action !== 'object') {
        return {};
    }

    return Object.fromEntries(
        Object.entries(action).sort(([left], [right]) => left.localeCompare(right)),
    );
}
