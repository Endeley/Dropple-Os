export const CANONICAL_DOCUMENT_SLICES = Object.freeze([
    'app',
    'assets',
    'bindings',
    'components',
    'exports',
    'layout',
    'meta',
    'motion',
    'sceneGraph',
    'scenes',
    'variables',
    'vectors',
]);

export function createCanonicalDocumentEnvelope({
    id = crypto.randomUUID(),
    name = 'Untitled',
    version = 1,
    now = Date.now(),
} = {}) {
    return {
        meta: {
            id,
            name,
            version,
            createdAt: now,
            updatedAt: now,
        },
        sceneGraph: {
            rootIds: [],
            nodes: {},
        },
        layout: {
            version: 1,
            nodes: {},
            computed: {},
            breakpoints: {
                mobile: 480,
                tablet: 768,
                desktop: 1200,
            },
            dirty: {
                nodeIds: [],
                fullPass: false,
                revision: 0,
            },
            metadata: {
                schemaVersion: 1,
            },
        },
        components: {
            definitions: {},
            instances: {},
            instanceOverrides: {},
        },
        app: {
            currentScreen: null,
            screens: {},
            state: {},
            flows: {},
        },
        vectors: {},
        variables: {},
        bindings: {},
        motion: {
            clips: {},
        },
        scenes: {
            scenes: {},
            activeSceneId: undefined,
        },
        assets: {
            images: {},
            videos: {},
            audio: {},
        },
        exports: {
            targets: [],
        },
    };
}

export function getDocumentEnvelope(state) {
    return state?.document ?? null;
}

export function withDocumentEnvelope(document) {
    return {
        document: document ?? createCanonicalDocumentEnvelope(),
    };
}
