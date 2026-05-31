import { createUuid } from '@/core/utils/createUuid.js';

export const CANONICAL_DOCUMENT_SLICES = Object.freeze([
    'app',
    'assets',
    'bindings',
    'components',
    'exports',
    'graphs',
    'layout',
    'meta',
    'motion',
    'rigs',
    'sceneGraph',
    'scenes',
    'sequences',
    'stateMachines',
    'themes',
    'tokenReviews',
    'tokenVersions',
    'tokens',
    'variables',
    'vectors',
]);

export function createCanonicalDocumentEnvelope({
    id = createUuid(),
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
        graphs: {},
        tokens: {},
        themes: {
            activeThemeId: null,
            byId: {},
            order: [],
        },
        tokenReviews: {
            entries: {},
            order: [],
            activeReviewId: null,
        },
        tokenVersions: {
            entries: {},
            order: [],
            activeVersionId: null,
        },
        vectors: {},
        variables: {},
        bindings: {},
        motion: {
            clips: {},
        },
        rigs: {
            rigs: {},
            activeRigId: null,
        },
        scenes: {
            scenes: {},
            activeSceneId: undefined,
        },
        sequences: {
            sequences: {},
            activeSequenceId: null,
        },
        stateMachines: {
            machines: {},
            activeMachineId: null,
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
