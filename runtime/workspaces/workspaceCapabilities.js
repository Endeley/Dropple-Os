export const WORKSPACE_CAPABILITIES = Object.freeze({
    design: Object.freeze(['graph']),
    media: Object.freeze(['graph', 'timeline']),
    build: Object.freeze([]),
    system: Object.freeze([]),
    collaborate: Object.freeze([]),
});

export const WORKSPACE_MODE_CAPABILITIES = Object.freeze({
    'media:animation': Object.freeze(['rig', 'stateMachine']),
    'media:audio': Object.freeze([]),
    'media:podcast': Object.freeze([]),
    'system:tokens': Object.freeze(['token-authoring']),
    'system:governance': Object.freeze(['token-versioning', 'token-review']),
    'system:versioning': Object.freeze(['token-versioning', 'token-review']),
});

export const WORKSPACE_OVERLAY_CAPABILITIES = Object.freeze({
    'build:ai-systems': Object.freeze(['ai-assist', 'ai-explain', 'ai-generate']),
    'collaborate:learning': Object.freeze([
        'guided-navigation',
        'step-through',
        'guided-explain',
    ]),
    'collaborate:comments': Object.freeze([]),
    'system:themes': Object.freeze(['theme-authoring']),
    'system:variants': Object.freeze([]),
});
