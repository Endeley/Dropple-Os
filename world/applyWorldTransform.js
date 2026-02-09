export function applyWorldTransform(node, nextTransform) {
    if (process.env.NODE_ENV === 'development') {
        if (
            typeof nextTransform?.position?.x !== 'number' ||
            typeof nextTransform?.position?.y !== 'number'
        ) {
            throw new Error('[Skeleton v2] Invalid world-space transform write');
        }
    }

    node.transform = nextTransform;
}
