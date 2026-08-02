import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildBlueprintLaunchHref,
    createBlueprintLaunchContext,
    resolveWorkspaceLaunchContextFromSearchParams,
} from '@/runtime/workspaces/index.js';

test('createBlueprintLaunchContext resolves canonical blueprint launch truth deterministically', () => {
    const left = createBlueprintLaunchContext({
        blueprintId: 'bp.logistics.v1',
    });
    const right = createBlueprintLaunchContext({
        blueprintId: 'bp.logistics.v1',
    });

    assert.deepEqual(left, right);
    assert.equal(left.blueprint.id, 'bp.logistics.v1');
    assert.equal(left.blueprint.versionId, 'bp.logistics.v1');
    assert.equal(left.certification.blueprint, 'dropple-certified');
    assert.equal(left.language, null);
    assert.equal(left.grammar, null);
});

test('buildBlueprintLaunchHref preserves compatibility bootstrap transport while emitting canonical launch context', () => {
    const href = buildBlueprintLaunchHref({
        perspectiveId: 'build',
        blueprintId: 'bp.logistics.v1',
    });
    const url = new URL(href, 'https://dropple.test');

    assert.equal(url.pathname, '/workspace/build');
    assert.equal(url.searchParams.get('bootstrap'), '1');
    assert.deepEqual(resolveWorkspaceLaunchContextFromSearchParams(url.searchParams), {
        version: 1,
        language: null,
        category: null,
        blueprint: {
            id: 'bp.logistics.v1',
            versionId: 'bp.logistics.v1',
        },
        template: null,
        grammar: null,
        certification: {
            blueprint: 'dropple-certified',
            template: null,
        },
    });
});
