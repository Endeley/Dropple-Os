export function ensureSceneCache(runtime) {
    if (!runtime.scene) {
        runtime.scene = {
            computed: {},
            layoutRoots: new Map(),
            dependencyGraph: null,
        };
        return runtime.scene;
    }

    if (!runtime.scene.computed) {
        runtime.scene.computed = {};
    }

    if (!(runtime.scene.layoutRoots instanceof Map)) {
        runtime.scene.layoutRoots = new Map();
    }

    if (!Object.prototype.hasOwnProperty.call(runtime.scene, 'dependencyGraph')) {
        runtime.scene.dependencyGraph = null;
    }

    return runtime.scene;
}

export function clearSceneCache(runtime) {
    const scene = ensureSceneCache(runtime);

    scene.computed = {};
    scene.layoutRoots = new Map();
    scene.dependencyGraph = null;
}
