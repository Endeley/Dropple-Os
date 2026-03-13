export function buildStyleClass(nodeId) {
    return `node-${sanitizeToken(nodeId)}`;
}

export function buildReactStyles(styles) {
    let css = '';

    for (const nodeId of Object.keys(styles).sort()) {
        const nodeStyles = styles[nodeId] || {};

        css += `.${buildStyleClass(nodeId)} {\n`;

        for (const key of Object.keys(nodeStyles).sort()) {
            const value = formatCssValue(key, nodeStyles[key]);
            if (value === null) {
                continue;
            }

            css += `  ${toCssKey(key)}: ${value};\n`;
        }

        css += '}\n\n';
    }

    return css;
}

function toCssKey(key) {
    return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function formatCssValue(key, value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'number' && requiresPxUnit(key)) {
        return `${value}px`;
    }

    return String(value);
}

function requiresPxUnit(key) {
    return ![
        'opacity',
        'zIndex',
        'fontWeight',
        'lineHeight',
        'flex',
        'flexGrow',
        'flexShrink',
        'order',
        'scale',
    ].includes(key);
}

function sanitizeToken(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '-');
}
