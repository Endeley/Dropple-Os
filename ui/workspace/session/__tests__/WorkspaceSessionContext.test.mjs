import test from 'node:test';
import assert from 'node:assert/strict';

import { createWorkspaceSession } from '../createWorkspaceSession.js';

test('workspace session exposes launch context as the sole session authority', () => {
    const session = createWorkspaceSession({
        workspaceId: 'design',
        modeId: 'uiux',
        launchContext: {
            version: 1,
            language: 'uiux',
            category: 'dashboard',
            blueprint: { id: 'bp.analytics-dashboard', versionId: 'bp.analytics-dashboard.v1' },
            template: { id: 'tpl.enterprise-dark', versionId: 'tpl.enterprise-dark.v3' },
            grammar: 'create',
            certification: { blueprint: 'dropple-certified', template: 'community' },
        },
    });

    assert.equal(session.workspaceId, 'design');
    assert.equal(session.modeId, 'uiux');
    assert.equal(session.language, 'uiux');
    assert.equal(session.category, 'dashboard');
    assert.equal(session.grammar, 'create');
    assert.deepEqual(session.blueprint, {
        id: 'bp.analytics-dashboard',
        versionId: 'bp.analytics-dashboard.v1',
    });
});

test('identical launch contexts produce identical workspace session truth regardless of origin', () => {
    const homepage = createWorkspaceSession({
        workspaceId: 'design',
        modeId: 'uiux',
        launchContext: {
            version: 1,
            language: 'uiux',
            category: 'dashboard',
            blueprint: { id: 'bp.analytics-dashboard', versionId: 'bp.analytics-dashboard.v1' },
            template: { id: 'tpl.enterprise-dark', versionId: 'tpl.enterprise-dark.v3' },
            grammar: 'create',
            certification: { blueprint: 'dropple-certified', template: 'dropple-certified' },
        },
    });

    const marketplace = createWorkspaceSession({
        workspaceId: 'design',
        modeId: 'uiux',
        launchContext: {
            version: 1,
            language: 'uiux',
            category: 'dashboard',
            blueprint: { id: 'bp.analytics-dashboard', versionId: 'bp.analytics-dashboard.v1' },
            template: { id: 'tpl.enterprise-dark', versionId: 'tpl.enterprise-dark.v3' },
            grammar: 'create',
            certification: { blueprint: 'dropple-certified', template: 'dropple-certified' },
        },
    });

    assert.deepEqual(homepage, marketplace);
});
