import { createSpatialIndex } from '@/runtime/spatial/index.js';

export function ensureSceneCache(runtime) {
    if (!runtime.scene) {
        runtime.scene = {
            activeSceneId: null,
            activeShotId: null,
            camera: null,
            temporalContext: null,
            computed: {},
            transformDirty: new Set(),
            layoutDirty: new Set(),
            paintDirty: new Set(),
            indexDirty: new Set(),
            layoutRoots: new Map(),
            dependencyGraph: null,
            segments: null,
            nodeToSegment: null,
            segmentGraph: null,
            evaluationOrder: null,
            evaluationLayers: null,
            spatialIndex: createSpatialIndex(128),
            partitions: null,
            nodeToPartition: null,
        };
        return runtime.scene;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'activeSceneId')) {
        runtime.scene.activeSceneId = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'activeShotId')) {
        runtime.scene.activeShotId = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'camera')) {
        runtime.scene.camera = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'temporalContext')) {
        runtime.scene.temporalContext = null;
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

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'segments')) {
        runtime.scene.segments = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'nodeToSegment')) {
        runtime.scene.nodeToSegment = null;
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'segmentGraph')) {
        runtime.scene.segmentGraph = null;
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

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'nodeToPartition')) {
        runtime.scene.nodeToPartition = null;
    }

    if (!runtime.scene.spatialIndex?.cells || !runtime.scene.spatialIndex?.nodeBounds) {
        runtime.scene.spatialIndex = createSpatialIndex(128);
    }

    return runtime.scene;
}

export function clearSceneCache(runtime) {
    const scene = ensureSceneCache(runtime);

    scene.activeSceneId = null;
    scene.activeShotId = null;
    scene.camera = null;
    scene.temporalContext = null;
    scene.computed = {};
    scene.transformDirty = new Set();
    scene.layoutDirty = new Set();
    scene.paintDirty = new Set();
    scene.indexDirty = new Set();
    scene.layoutRoots = new Map();
    scene.dependencyGraph = null;
    scene.segments = null;
    scene.nodeToSegment = null;
    scene.segmentGraph = null;
    scene.evaluationOrder = null;
    scene.evaluationLayers = null;
    scene.spatialIndex = createSpatialIndex(128);
    scene.partitions = null;
    scene.nodeToPartition = null;
}
