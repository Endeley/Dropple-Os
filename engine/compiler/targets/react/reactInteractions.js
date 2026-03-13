export function buildReactInteractionMap(context) {
    const interactions = context.application?.interactions || [];
    const byNode = {};

    for (const interaction of interactions) {
        if (!byNode[interaction.sourceNodeId]) {
            byNode[interaction.sourceNodeId] = [];
        }

        byNode[interaction.sourceNodeId].push(interaction);
    }

    for (const nodeId of Object.keys(byNode)) {
        byNode[nodeId].sort((left, right) => left.id.localeCompare(right.id));
    }

    return byNode;
}

export function buildReactHandler(interaction, options = {}) {
    const action = interaction.action || {};
    const stateAccessor = options.stateAccessor || 'local';
    const navigateAccessor = options.navigateAccessor || 'navigate';

    if (action.type === 'setState' && typeof action.target === 'string') {
        const [slice, key] = action.target.split('.');
        const setter = stateAccessor === 'props'
            ? `props.set${capitalize(slice)}`
            : `set${capitalize(slice)}`;

        if (!key) {
            return `() => ${setter}(${JSON.stringify(action.value)})`;
        }

        return `() => ${setter}((prev) => ({ ...prev, ${JSON.stringify(key)}: ${JSON.stringify(action.value)} }))`;
    }

    if (action.type === 'navigate') {
        return `() => ${navigateAccessor}(${JSON.stringify(action.to)})`;
    }

    if (interaction.event === 'input' && action.formId && action.field) {
        const setter = stateAccessor === 'props'
            ? `props.set${capitalize(action.formId)}`
            : `set${capitalize(action.formId)}`;

        return `(e) => ${setter}((prev) => ({ ...prev, ${JSON.stringify(action.field)}: e.target.value }))`;
    }

    return '() => {}';
}

export function buildReactEventProps(nodeId, context, options = {}) {
    const interactionMap = options.interactionMap || buildReactInteractionMap(context);
    const interactions = interactionMap[nodeId] || [];

    return interactions
        .map((interaction) => {
            if (interaction.event === 'click') {
                return `onClick={${buildReactHandler(interaction, options)}}`;
            }

            if (interaction.event === 'change') {
                return `onChange={${buildReactHandler(interaction, options)}}`;
            }

            if (interaction.event === 'input') {
                return `onChange={${buildReactHandler(interaction, options)}}`;
            }

            return '';
        })
        .filter(Boolean)
        .join(' ');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
