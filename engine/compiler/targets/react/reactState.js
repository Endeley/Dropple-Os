export function buildReactState(context) {
    const state = context.application?.state || {};
    const declarations = [];

    for (const sliceName of Object.keys(state).sort()) {
        const value = JSON.stringify(state[sliceName], null, 2);
        declarations.push(
            `const [${sliceName}, set${capitalize(sliceName)}] = React.useState(${value});`,
        );
    }

    return declarations.join('\n  ');
}

export function buildReactStateProps(context, scope = 'local') {
    const state = context.application?.state || {};

    return Object.keys(state)
        .sort()
        .flatMap((sliceName) => [
            `${sliceName}={${propertyAccess(scope, sliceName)}}`,
            `set${capitalize(sliceName)}={${propertyAccess(scope, `set${capitalize(sliceName)}`)}}`,
        ])
        .join(' ');
}

function propertyAccess(scope, name) {
    return scope === 'props' ? `props.${name}` : name;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
