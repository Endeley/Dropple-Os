import test from 'node:test';
import assert from 'node:assert/strict';

import {
    WORKSPACE_LAUNCH_CONTEXT_VERSION,
    applyWorkspaceLaunchContextToSearchParams,
    createWorkspaceLaunchContext,
    resolveWorkspaceLaunchContextFromSearchParams,
} from '../workspaceLaunchContext.js';

test('createWorkspaceLaunchContext returns null when no launch truth exists', () => {
    assert.equal(createWorkspaceLaunchContext({}), null);
});

test('resolveWorkspaceLaunchContextFromSearchParams reads complete launch context deterministically', () => {
    const searchParams = new URLSearchParams({
        language: 'uiux',
        category: 'dashboard',
        blueprint: 'bp.analytics-dashboard',
        blueprintVersionId: 'bp.analytics-dashboard.v1',
        template: 'tpl.enterprise-dark',
        templateVersionId: 'tpl.enterprise-dark.v3',
        grammar: 'create',
        blueprintCertification: 'dropple-certified',
        templateCertification: 'community',
    });

    assert.deepEqual(resolveWorkspaceLaunchContextFromSearchParams(searchParams), {
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: 'uiux',
        category: 'dashboard',
        blueprint: {
            id: 'bp.analytics-dashboard',
            versionId: 'bp.analytics-dashboard.v1',
        },
        template: {
            id: 'tpl.enterprise-dark',
            versionId: 'tpl.enterprise-dark.v3',
        },
        grammar: 'create',
        certification: {
            blueprint: 'dropple-certified',
            template: 'community',
        },
    });
});

test('applyWorkspaceLaunchContextToSearchParams persists launch truth without losing existing query state', () => {
    const searchParams = applyWorkspaceLaunchContextToSearchParams({
        searchParams: new URLSearchParams({ entry: 'uiux' }),
        launchContext: {
            language: 'uiux',
            grammar: 'create',
            blueprint: { id: 'bp.analytics-dashboard', versionId: 'bp.analytics-dashboard.v1' },
        },
    });

    assert.equal(searchParams.get('entry'), 'uiux');
    assert.equal(searchParams.get('launchContextVersion'), String(WORKSPACE_LAUNCH_CONTEXT_VERSION));
    assert.equal(searchParams.get('language'), 'uiux');
    assert.equal(searchParams.get('grammar'), 'create');
    assert.equal(searchParams.get('blueprint'), 'bp.analytics-dashboard');
    assert.equal(searchParams.get('blueprintVersionId'), 'bp.analytics-dashboard.v1');
});
