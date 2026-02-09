export function canProjectToCanonicalNode(node) {
    return (
        node &&
        typeof node.id === 'string' &&
        typeof node.type === 'string' &&
        node.transform &&
        node.meta
    );
}
