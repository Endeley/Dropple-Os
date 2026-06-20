export const ARCHITECTURE_DRIFT_RULES = Object.freeze([
    Object.freeze({
        id: 'DRIFT-001',
        legacyId: 'core-imports-higher-layers',
        name: 'Core -> Higher Layer Import',
        owner: 'Constitutional Stack',
        law: 'CONSTITUTIONAL_STACK_V1.md',
        reason: 'Core must remain independent of runtime, UI, workspace implementation, and product layers.',
        suggestedFix:
            'Move the dependency downward into a runtime/UI layer or extract the shared logic into a lower-layer module.',
        roots: Object.freeze(['core']),
        description: 'Core layer must not import runtime, ui, workspace, or product roots',
        patterns: Object.freeze([
            /from\s+['"]@\/runtime\//,
            /from\s+['"]@\/ui\//,
            /from\s+['"]@\/workspace\//,
            /from\s+['"]@\/workspaces\//,
            /from\s+['"]@\/product\//,
            /from\s+['"](?:\.\.\/)+(runtime|ui|workspace|workspaces|product)\//,
        ]),
    }),
    Object.freeze({
        id: 'DRIFT-002',
        legacyId: 'infrastructure-imports-higher-layers',
        name: 'Infrastructure -> Higher Layer Import',
        owner: 'Constitutional Stack',
        law: 'CONSTITUTIONAL_STACK_V1.md',
        reason: 'Infrastructure must remain independent of runtime, UI, workspace implementation, and product layers.',
        suggestedFix:
            'Move the dependency into a higher layer caller or extract the shared logic into infrastructure/core.',
        roots: Object.freeze(['infrastructure']),
        description: 'Infrastructure layer must not import runtime, ui, workspace, or product roots',
        patterns: Object.freeze([
            /from\s+['"]@\/runtime\//,
            /from\s+['"]@\/ui\//,
            /from\s+['"]@\/workspace\//,
            /from\s+['"]@\/workspaces\//,
            /from\s+['"]@\/product\//,
            /from\s+['"](?:\.\.\/)+(runtime|ui|workspace|workspaces|product)\//,
        ]),
    }),
    Object.freeze({
        id: 'DRIFT-003',
        legacyId: 'runtime-imports-ui',
        name: 'Runtime -> UI Import',
        owner: 'Shared Interaction Authority',
        law: 'CONSTITUTIONAL_STACK_V1.md',
        reason: 'Runtime must remain projection-independent.',
        suggestedFix:
            'Move the shared pure logic into a runtime-owned module or move the dependent test beside the UI implementation.',
        roots: Object.freeze(['runtime']),
        description: 'Runtime layer must not import UI roots',
        patterns: Object.freeze([
            /from\s+['"]@\/ui\//,
            /from\s+['"](?:\.\.\/)+ui\//,
        ]),
    }),
    Object.freeze({
        id: 'DRIFT-004',
        legacyId: 'federation-bridge-imports-authority',
        name: 'Federation Bridge -> Authority Import',
        owner: 'Bridge Authority',
        law: 'CONSTITUTIONAL_STACK_V1.md',
        reason: 'Create-session federation bridges must remain coordination-only and never import reducer or state authority internals.',
        suggestedFix:
            'Route the behavior through canonical bridge/projection entrypoints and keep reducer or state authority out of the bridge.',
        roots: Object.freeze(['runtime/input']),
        fileMatchers: Object.freeze(['createSessionFederationRuntimeBridge.js']),
        description: 'Create-session federation bridge must stay coordination-only and never import reducer/core authority paths',
        patterns: Object.freeze([
            /from\s+['"]@\/core\/events\/reducers\//,
            /from\s+['"]@\/runtime\/state\//,
            /from\s+['"]@\/runtime\/dispatcher\/dispatcherStore\//,
            /\buseRuntimeStore\b/,
            /\.setState\s*\(/,
        ]),
    }),
]);

export const ARCHITECTURE_DRIFT_RULES_BY_ID = Object.freeze(
    Object.fromEntries(ARCHITECTURE_DRIFT_RULES.map((rule) => [rule.id, rule])),
);
