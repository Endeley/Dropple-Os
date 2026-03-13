export const derivedCacheRegistry = Object.freeze({
    scene: Object.freeze({
        computed: Object.freeze({
            source: ['document.sceneGraph', 'document.layout', 'document.motion'],
            persisted: false,
        }),
        layoutRoots: Object.freeze({
            source: ['document.sceneGraph', 'document.layout'],
            persisted: false,
        }),
        dependencyGraph: Object.freeze({
            source: ['document.sceneGraph'],
            persisted: false,
        }),
        segments: Object.freeze({
            source: ['document.sceneGraph'],
            persisted: false,
        }),
        nodeToSegment: Object.freeze({
            source: ['document.sceneGraph'],
            persisted: false,
        }),
        segmentGraph: Object.freeze({
            source: ['document.sceneGraph'],
            persisted: false,
        }),
        evaluationOrder: Object.freeze({
            source: ['document.sceneGraph', 'runtime.scene.dependencyGraph'],
            persisted: false,
        }),
        evaluationLayers: Object.freeze({
            source: ['document.sceneGraph', 'runtime.scene.dependencyGraph'],
            persisted: false,
        }),
        spatialIndex: Object.freeze({
            source: ['document.sceneGraph', 'runtime.scene.computed'],
            persisted: false,
        }),
        partitions: Object.freeze({
            source: ['document.sceneGraph', 'runtime.scene.computed'],
            persisted: false,
        }),
        nodeToPartition: Object.freeze({
            source: ['document.sceneGraph', 'runtime.scene.partitions'],
            persisted: false,
        }),
    }),
});

export function getDerivedCacheDescriptor(domain, cacheKey) {
    return derivedCacheRegistry?.[domain]?.[cacheKey] ?? null;
}

export function assertDerivedCacheDescriptor(domain, cacheKey) {
    const descriptor = getDerivedCacheDescriptor(domain, cacheKey);
    if (!descriptor) {
        throw new Error(`Unknown derived cache descriptor: ${domain}.${cacheKey}`);
    }
    if (descriptor.persisted !== false) {
        throw new Error(`Derived cache ${domain}.${cacheKey} must not be persisted`);
    }
    return descriptor;
}
