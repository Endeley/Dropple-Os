export function generateCssVariables(tokens, selector = ':root') {
    let css = `${selector} {\n`;

    for (const category of Object.keys(tokens || {}).sort()) {
        const group = tokens[category] || {};

        for (const name of Object.keys(group).sort()) {
            css += `  --${toTokenCategory(category)}-${toTokenName(name)}: ${group[name]};\n`;
        }
    }

    css += '}\n';

    return css;
}

function toTokenCategory(category) {
    return category.replace(/s$/, '');
}

function toTokenName(name) {
    return String(name).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
}
