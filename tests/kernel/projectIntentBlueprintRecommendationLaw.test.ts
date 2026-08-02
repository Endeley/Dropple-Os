import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProjectIntentRecommendationRoute,
    resolveProjectIntentBlueprintRecommendations,
} from '@/runtime/workspaces/projectIntentBlueprintRecommendation.js';
import { resolveWorkspaceLaunchContextFromSearchParams } from '@/runtime/workspaces/index.js';

test('project intent blueprint recommendations are deterministic for equivalent logistics intent', () => {
    const input = Object.freeze({
        intent: 'Build a trucking company with fleet dispatch and warehouse operations',
    });

    const left = resolveProjectIntentBlueprintRecommendations(input);
    const right = resolveProjectIntentBlueprintRecommendations(input);

    assert.deepEqual(left, right);
    assert.equal(left[0]?.id, 'bp.logistics.v1');
});

test('project intent blueprint recommendations prefer the startup blueprint for product-launch intent', () => {
    const result = resolveProjectIntentBlueprintRecommendations({
        intent: 'Launch a startup website and app for a new product company',
    });

    assert.equal(result[0]?.id, 'bp.startup.v2');
});

test('project intent blueprint recommendations fail closed for empty or unsupported intent', () => {
    assert.deepEqual(resolveProjectIntentBlueprintRecommendations({ intent: '' }), []);
    assert.deepEqual(resolveProjectIntentBlueprintRecommendations({ intent: 'paint clouds softly' }), []);
});

test('project intent recommendation route bootstraps canonical create perspective', () => {
    const href = buildProjectIntentRecommendationRoute('bp.logistics.v1');
    const url = new URL(href, 'https://dropple.test');

    assert.equal(url.pathname, '/workspace/create');
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
    assert.equal(buildProjectIntentRecommendationRoute(' '), '/workspace/create');
});
