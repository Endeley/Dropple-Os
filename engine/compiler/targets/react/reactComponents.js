export function resolveReactTag(node) {
    switch (node?.type) {
        case 'button':
            return 'button';
        case 'text':
        case 'span':
            return 'span';
        case 'img':
        case 'image':
            return 'img';
        case 'section':
            return 'section';
        case 'main':
            return 'main';
        default:
            return 'div';
    }
}

export function resolveComponentName(node) {
    const value = node?.type && node.type !== 'screen' ? node.type : node?.id;
    return capitalize(sanitizeIdentifier(value || 'Component'));
}

export function resolveScreenName(id) {
    return `${capitalize(sanitizeIdentifier(id || 'Home'))}Screen`;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function sanitizeIdentifier(value) {
    return String(value)
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
