import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProjectViewShareHref,
    getProjectShellRecentViewsStorageKey,
    mergeRecentProjectRoutes,
    normalizeRecentProjectRoutes,
} from '@/runtime/workspaces/projectShellRouteState.js';

test('project shell recent views storage key is deterministic', () => {
    assert.equal(getProjectShellRecentViewsStorageKey(), 'dropple.projectShell.recentViews.v1');
});

test('recent project route normalization is deterministic, unique, and bounded', () => {
    const routes = normalizeRecentProjectRoutes([
        ' /workspace/create?entry=uiux ',
        '/workspace/create?entry=uiux',
        '',
        null,
        '/workspace/build?entry=application',
        '/workspace/operate?entry=automation',
        '/workspace/collaborate?entry=review',
        '/workspace/publish?entry=governance',
        '/workspace/overview?entry=uiux',
        '/workspace/create?entry=graphic',
        '/workspace/create?entry=document',
        '/workspace/create?entry=animation',
        '/workspace/create?entry=video',
    ]);
    assert.deepEqual(
        routes,
        Object.freeze([
            '/workspace/create?entry=uiux',
            '/workspace/build?entry=application',
            '/workspace/operate?entry=automation',
            '/workspace/collaborate?entry=review',
            '/workspace/publish?entry=governance',
            '/workspace/overview?entry=uiux',
            '/workspace/create?entry=graphic',
            '/workspace/create?entry=document',
        ]),
    );
    assert.equal(Object.isFrozen(routes), true);
});

test('merge recent routes prioritizes active route and deduplicates deterministically', () => {
    const merged = mergeRecentProjectRoutes({
        activeRoute: '/workspace/build?entry=automation',
        previousRoutes: ['/workspace/create?entry=uiux', '/workspace/build?entry=automation'],
    });
    assert.deepEqual(
        merged,
        Object.freeze(['/workspace/build?entry=automation', '/workspace/create?entry=uiux']),
    );
});

test('project share href builder preserves query params and fails closed', () => {
    const withQuery = buildProjectViewShareHref({
        pathname: '/workspace/create',
        searchParams: new URLSearchParams('entry=uiux&x=12.35&y=-9.40&z=1.235'),
    });
    const withoutQuery = buildProjectViewShareHref({
        pathname: '',
        searchParams: null,
    });
    assert.equal(withQuery, '/workspace/create?entry=uiux&x=12.35&y=-9.40&z=1.235');
    assert.equal(withoutQuery, '/workspace/overview');
});
