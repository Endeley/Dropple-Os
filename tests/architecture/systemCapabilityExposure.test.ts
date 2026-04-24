import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { resolveWorkspaceCapabilities } from '@/runtime/workspaces/index.js';

test('system workspace modes expose canonical authoring capabilities through mode overlays', () => {
    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'tokens',
        }),
        ['token-authoring'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'themes',
        }),
        ['theme-authoring'],
    );

    assert.deepEqual(
        resolveWorkspaceCapabilities({
            workspace: 'system',
            mode: 'versioning',
        }),
        ['token-versioning', 'token-review'],
    );
});

test('system authoring capabilities expose command layers without owning dispatcher truth', () => {
    const registrySource = fs.readFileSync('ui/workspace/capabilities/capabilityRegistry.js', 'utf8');
    const intentSource = fs.readFileSync('ui/workspace/system/tokenAuthoringIntent.js', 'utf8');

    assert.match(registrySource, /'token-authoring'/);
    assert.match(registrySource, /'theme-authoring'/);
    assert.match(registrySource, /'token-versioning'/);
    assert.match(registrySource, /'token-review'/);
    assert.match(registrySource, /createTokenAuthoringCommandLayer/);
    assert.match(registrySource, /TokenVersionGraphPanel/);
    assert.match(registrySource, /tools:\s*Object\.freeze\(\[\]\)/);
    assert.match(intentSource, /mergeTokenVersion/);
    assert.match(intentSource, /rollbackTokenVersion/);
    assert.match(intentSource, /approveTokenReview/);
});

test('system authoring intent and capability files do not import reducers or dispatcher internals', () => {
    const files = [
        'ui/workspace/system/tokenAuthoringIntent.js',
        'ui/workspace/capabilities/capabilityRegistry.js',
        'ui/workspace/capabilities/reconcileCapabilityLifecycle.js',
    ];

    const forbidden = [
        /core\/events\/reducers\//,
        /runtime\/dispatcher\//,
        /runtime\/boundary\/DispatcherContext/,
    ];

    const violations = [];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            if (!line.includes('import')) return;
            if (forbidden.some((pattern) => pattern.test(line))) {
                violations.push(`${file}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});
