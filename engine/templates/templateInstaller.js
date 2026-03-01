function deepClone(value) {
    if (value == null) return value;
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

export function installCertifiedTemplate(template, runtimeStore) {
    if (!template || typeof template !== 'object' || !template.graph) {
        throw new Error('Invalid template structure.');
    }
    if (!runtimeStore || typeof runtimeStore.setState !== 'function') {
        throw new Error('installCertifiedTemplate requires a runtime store with setState.');
    }

    const nextGraph = deepClone(template.graph);

    runtimeStore.setState({
        sceneGraph: nextGraph,
    });

    return {
        installed: true,
        structuralHash: template?.certification?.structuralHash ?? null,
    };
}
