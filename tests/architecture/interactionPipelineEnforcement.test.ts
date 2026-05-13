import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runArchitectureGuard } from '@/scripts/architectureGuard.mjs';
import {
    INVALIDATING_TOOL_DESCRIPTOR_FIELDS,
    MERGEABLE_TOOL_DESCRIPTOR_FIELDS,
    resolveToolSemanticFieldGovernance,
    TOOL_SEMANTIC_FIELD_GOVERNANCE,
    WINNER_OWNED_TOOL_DESCRIPTOR_FIELDS,
} from '@/runtime/tools/toolSemanticPolicy.js';
import { EXECUTION_SIGNATURE_MIGRATION_WINDOWS } from '@/runtime/tools/resolveToolExecutionSignatureMigration.js';

const ROOT = process.cwd();

function read(pathname) {
    return fs.readFileSync(path.join(ROOT, pathname), 'utf8');
}

function walk(dir, relBase = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relPath = relBase ? path.join(relBase, entry.name) : entry.name;
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...walk(fullPath, relPath));
            continue;
        }

        files.push(relPath);
    }

    return files;
}

test('architecture laws document exists and defines the single interaction pipeline', () => {
    const content = read('docs/ARCHITECTURE_LAWS.md');

    assert.match(content, /# Dropple Architecture Laws/);
    assert.match(content, /Input -> Tool -> Drag -> Resolve -> Magnetic -> Reducer -> Projection -> UI/);
    assert.match(content, /No Temporary Authority/);
    assert.match(content, /Every implementation, optimization, and upgrade must use the final lawful authority model/);
});

test('constitutional law forbids temporary authority paths across implementation work', () => {
    const content = read('docs/LAW.md');

    assert.match(content, /No Temporary Authority Paths/);
    assert.match(content, /Dropple does not implement temporary authority paths/);
    assert.match(content, /This law applies every time Dropple implements, optimizes, or upgrades a system/);
    assert.match(content, /the feature waits/);
});

test('constitutional law defines deterministic execution provenance and coordination non-authority', () => {
    const content = read('docs/LAW.md');
    const architecture = read('docs/ARCHITECTURE_LAWS.md');

    assert.match(content, /Execution Provenance Law/);
    assert.match(content, /Execution provenance must be:/);
    assert.match(content, /deterministic/);
    assert.match(content, /immutable/);
    assert.match(content, /reconstructible/);
    assert.match(content, /replay-safe/);
    assert.match(content, /Resumed execution and uninterrupted execution must preserve canonical execution identity/);
    assert.match(content, /Execution coordination systems may not mutate:/);
    assert.match(content, /manifest truth/);
    assert.match(content, /session truth/);
    assert.match(content, /authored runtime truth/);

    assert.match(architecture, /Execution Provenance/);
    assert.match(architecture, /Resumed execution and uninterrupted execution must preserve canonical execution identity/);
    assert.match(architecture, /Coordination systems may not mutate manifest truth, session truth, or authored runtime truth/);
});

test('constitutional law defines interpreted tool non-sovereignty', () => {
    const content = read('docs/LAW.md');
    const architecture = read('docs/ARCHITECTURE_LAWS.md');

    assert.match(content, /Interpreted Tool Non-Sovereignty Law/);
    assert.match(content, /Interpreted tools may express intent/);
    assert.match(content, /Interpreted tools may not own authority/);
    assert.match(content, /tool-registration mutation paths/);
    assert.match(content, /recursively synthesize tool-owned authority/);
    assert.match(content, /Tool synthesis must remain capability-bounded, dispatcher-owned, and replay-safe/);

    assert.match(architecture, /Interpreted Tool Non-Sovereignty/);
    assert.match(architecture, /Interpreted tools may express intent but may not own authority/);
    assert.match(architecture, /recursive tool-owned authority synthesis/);
});

test('constitutional law defines synthesized semantic projection governance', () => {
    const content = read('docs/LAW.md');
    const architecture = read('docs/ARCHITECTURE_LAWS.md');

    assert.match(content, /Semantic Projection Governance Law/);
    assert.match(content, /one canonical projected meaning/);
    assert.match(content, /Equivalent ownership topologies must produce equivalent semantic projection/);
    assert.match(content, /winner-owned/);
    assert.match(content, /mergeable/);
    assert.match(content, /constitutionally invalid/);
    assert.match(content, /handlerFamily/);
    assert.match(content, /handlerPayload/);
    assert.match(content, /executionSignature/);
    assert.match(content, /group/);
    assert.match(content, /one canonical execution contract/);
    assert.match(content, /tool-id-scoped migration windows/);
    assert.match(content, /deterministic, bounded, and non-authoritative/);

    assert.match(architecture, /Semantic Projection Governance/);
    assert.match(architecture, /one canonical projected meaning/);
    assert.match(architecture, /winner-owned fields/);
    assert.match(architecture, /mergeable fields/);
    assert.match(architecture, /invalid conflict fields/);
    assert.match(architecture, /tool-id migration windows/);
});

test('tool semantic policy formalizes field governance classes explicitly', () => {
    assert.deepEqual(WINNER_OWNED_TOOL_DESCRIPTOR_FIELDS, ['defaultActive', 'label']);
    assert.deepEqual(MERGEABLE_TOOL_DESCRIPTOR_FIELDS, ['capabilityTags', 'intentTopics']);
    assert.deepEqual(INVALIDATING_TOOL_DESCRIPTOR_FIELDS, ['executionSignature', 'group', 'handlerFamily', 'handlerPayload']);

    assert.equal(resolveToolSemanticFieldGovernance('label'), 'winner-owned');
    assert.equal(resolveToolSemanticFieldGovernance('defaultActive'), 'winner-owned');
    assert.equal(resolveToolSemanticFieldGovernance('intentTopics'), 'mergeable');
    assert.equal(resolveToolSemanticFieldGovernance('capabilityTags'), 'mergeable');
    assert.equal(resolveToolSemanticFieldGovernance('handlerFamily'), 'constitutionally-invalid-on-conflict');
    assert.equal(resolveToolSemanticFieldGovernance('handlerPayload'), 'constitutionally-invalid-on-conflict');
    assert.equal(resolveToolSemanticFieldGovernance('executionSignature'), 'constitutionally-invalid-on-conflict');
    assert.equal(resolveToolSemanticFieldGovernance('group'), 'constitutionally-invalid-on-conflict');
    assert.equal(resolveToolSemanticFieldGovernance('unknownField'), null);

    assert.deepEqual(
        Object.keys(TOOL_SEMANTIC_FIELD_GOVERNANCE).sort((left, right) => left.localeCompare(right)),
        ['capabilityTags', 'defaultActive', 'executionSignature', 'group', 'handlerFamily', 'handlerPayload', 'intentTopics', 'label'],
    );
});

test('execution-signature migration windows must define deterministic expiry and lineage metadata', () => {
    const windows = Object.entries(EXECUTION_SIGNATURE_MIGRATION_WINDOWS);
    assert.ok(windows.length > 0);

    for (const [toolId, window] of windows) {
        assert.equal(typeof toolId, 'string');
        assert.ok(toolId.trim().length > 0);
        assert.equal(typeof window?.sunsetAt, 'string');
        assert.ok(window.sunsetAt.trim().length > 0);
        assert.ok(Number.isFinite(Date.parse(window.sunsetAt)));
        assert.equal(typeof window?.ticket, 'string');
        assert.ok(window.ticket.trim().length > 0);
    }
});

test('future interpreted tool modules may not import authority internals directly', () => {
    const runtimeToolsRoot = path.join(ROOT, 'runtime', 'tools');
    const files = walk(runtimeToolsRoot, 'runtime/tools').filter((file) => {
        if (file.includes('__tests__')) return false;
        return /(interpret.*tool|tool.*spec|synth.*tool|generated.*tool)/i.test(path.basename(file));
    });

    const forbiddenImports = [
        '@/runtime/dispatcher/dispatch.js',
        '@/runtime/state/runtimeState.internal.js',
        '@/runtime/actions/toolActions.js',
        '@/core/events/reducers/',
        '@/core/mutationContext.js',
    ];
    const forbiddenTokens = [
        '__setRuntimeStateInternal',
        'hydrateRuntimeState(',
        'registerTools(',
        'unregisterTools(',
    ];

    const violations = [];

    for (const relativePath of files) {
        const content = read(relativePath);

        for (const target of forbiddenImports) {
            if (content.includes(target)) {
                violations.push(`${relativePath}: forbidden import ${target}`);
            }
        }

        for (const token of forbiddenTokens) {
            if (content.includes(token)) {
                violations.push(`${relativePath}: forbidden authority token ${token}`);
            }
        }
    }

    assert.deepEqual(violations, []);
});

test('tool handlers dispatch events instead of mutating runtime truth directly', () => {
    const content = read('ui/bridges/toolHandlerRegistrationFacade.js');
    const lines = content.split('\n');
    const forbidden = [
        /runtimeState\.[A-Za-z0-9_.[\]]+\s*=/,
        /nodesById\[[^\]]+\]\s*=/,
        /node\.layout\.(x|y|width|height|rotation)\s*=/,
        /node\.(x|y|width|height|rotation)\s*=/,
    ];

    const violations = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => forbidden.some((pattern) => pattern.test(line)))
        .map(({ line, index }) => `ui/bridges/toolHandlerRegistrationFacade.js:${index + 1}: ${line.trim()}`);

    assert.deepEqual(violations, []);
});

test('interaction engines stay pure and do not depend on ui react dom or time randomness', () => {
    const content = read('scripts/architectureGuard.mjs');

    assert.match(content, /interaction-engine-purity/);
    assert.match(content, /from \['"\]react/);
    assert.match(content, /\\bwindow\\b/);
    assert.match(content, /\\bdocument\\b/);
    assert.match(content, /Math\\\.random/);
    assert.match(content, /Date\\\.now/);
});

test('architecture guard scanner runs without reporting violations', () => {
    assert.doesNotThrow(() => runArchitectureGuard());
});
