export const WORKSPACE_CONTRACTS = Object.freeze({
    design: Object.freeze({
        required: Object.freeze(['graphs']),
    }),
    media: Object.freeze({
        required: Object.freeze(['graphs', 'motion', 'sequences', 'assets', 'exports']),
    }),
    build: Object.freeze({
        required: Object.freeze(['graphs']),
    }),
    system: Object.freeze({
        required: Object.freeze(['tokens', 'themes', 'tokenReviews', 'tokenVersions']),
    }),
    collaborate: Object.freeze({
        required: Object.freeze([]),
    }),
});

export const WORKSPACE_MODE_CONTRACTS = Object.freeze({
    'media:animation': Object.freeze({
        required: Object.freeze(['rigs', 'stateMachines']),
    }),
});
