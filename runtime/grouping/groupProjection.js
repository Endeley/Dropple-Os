export function groupProjection(runtime) {
    const nodes = runtime?.document?.sceneGraph?.nodes ?? runtime?.nodes ?? {};
    const groups = Object.values(nodes).filter((node) => node?.type === 'group');

    return Object.freeze({
        count: groups.length,
    });
}
