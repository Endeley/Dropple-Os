import { createSpatialIndex } from '@/runtime/spatial/index.js';

export function ensureSceneCache(runtime) {
    if (!runtime.scene) {
        runtime.scene = {
            computed: {},
            transformDirty: new Set(),
            layoutDirty: new Set(),
            paintDirty: new Set(),
            indexDirty: new Set(),
            layoutRoots: new Map(),
            dependencyGraph: null,
            evaluationOrder: null,
            evaluationLayers: null,
            spatialIndex: createSpatialIndex(128),
            partitions: null,
        };
        return runtime.scene;
    }

    if (!runtime.scene.computed) {
        runtime.scene.computed = {};
    }

    if (!(runtime.scene.transformDirty instanceof Set)) runtime.scene.transformDirty = new Set();
    if (!(runtime.scene.layoutDirty instanceof Set)) runtime.scene.layoutDirty = new Set();
    if (!(runtime.scene.paintDirty instanceof Set)) runtime.scene.paintDirty = new Set();
    if (!(runtime.scene.indexDirty instanceof Set)) runtime.scene.indexDirty = new Set();

    if (!(runtime.scene.layoutRoots instanceof Map)) {
        runtime.scene.layoutRoots = new Map();
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'dependencyGraph')) {
        runtime.scene.dependencyGraph = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'evaluationOrder')) {
        runtime.scene.evaluationOrder = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'evaluationLayers')) {
        runtime.scene.evaluationLayers = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'partitions')) {
        runtime.scene.partitions = null;
    }

    if (!runtime.scene.spatialIndex?.cells || !runtime.scene.spatialIndex?.nodeBounds) {
        runtime.scene.spatialIndex = createSpatialIndex(128);
    }

    return runtime.scene;
}

export function clearSceneCache(runtime) {
    const scene = ensureSceneCache(runtime);

    scene.computed = {};
    scene.transformDirty = new Set();
    scene.layoutDirty = new Set();
    scene.paintDirty = new Set();
    scene.indexDirty = new Set();
    scene.layoutRoots = new Map();
    scene.dependencyGraph = null;
    scene.evaluationOrder = null;
    scene.evaluationLayers = null;
    scene.spatialIndex = createSpatialIndex(128);
    scene.partitions = null;
}
