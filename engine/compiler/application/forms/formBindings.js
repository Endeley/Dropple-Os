export function buildReactFormBindings(form) {
    const initialState = form.fields
        .map((field) => `  ${field.name}: ""`)
        .join(',\n');

    return `const [${form.id}, set${capitalize(form.id)}] = React.useState({\n${initialState}\n});`;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
