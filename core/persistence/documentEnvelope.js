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

function createUuidFallback() {
    const globalCrypto = globalThis.crypto;

    if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
        return globalCrypto.randomUUID();
    }

    // RFC4122-ish v4 fallback for runtimes without crypto.randomUUID.
    const randomBytes =
        globalCrypto && typeof globalCrypto.getRandomValues === 'function'
            ? globalCrypto.getRandomValues(new Uint8Array(16))
            : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));

    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

    const hex = [...randomBytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createCanonicalDocumentEnvelope({
    id = createUuidFallback(),
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
