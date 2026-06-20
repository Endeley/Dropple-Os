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
    'build:systems-engineering': Object.freeze([
        'systems-graph',
        'systems-control',
        'systems-dataflow',
        'systems-simulation',
        'systems-documentation',
    ]),
    'build:enterprise-operations': Object.freeze([
        'ops-process',
        'ops-automation',
        'ops-datasource',
        'ops-roles',
        'ops-ai-assist',
    ]),
    'collaborate:learning': Object.freeze([
        'guided-navigation',
        'step-through',
        'guided-explain',
    ]),
    'collaborate:comments': Object.freeze([]),
    'system:themes': Object.freeze(['theme-authoring']),
    'system:variants': Object.freeze([]),
});

export const WORKSPACE_COMMAND_CAPABILITIES = Object.freeze({
    graphic: Object.freeze({
        group: true,
        ungroup: true,
    }),
    uiux: Object.freeze({
        group: true,
        ungroup: true,
    }),
    design: Object.freeze({
        group: true,
        ungroup: true,
    }),
    prototype: Object.freeze({
        group: false,
        ungroup: false,
    }),
    motion: Object.freeze({
        group: false,
        ungroup: false,
    }),
    dev: Object.freeze({
        group: false,
        ungroup: false,
    }),
    animation: Object.freeze({
        group: false,
        ungroup: false,
    }),
    media: Object.freeze({
        group: false,
        ungroup: false,
    }),
    build: Object.freeze({
        group: false,
        ungroup: false,
    }),
    system: Object.freeze({
        group: false,
        ungroup: false,
    }),
    collaborate: Object.freeze({
        group: false,
        ungroup: false,
    }),
});

export function canRunWorkspaceCommand(workspaceOrModeId, commandId) {
    const commandCaps = WORKSPACE_COMMAND_CAPABILITIES[workspaceOrModeId];
    if (!commandCaps) return false;
    return commandCaps[commandId] === true;
}
