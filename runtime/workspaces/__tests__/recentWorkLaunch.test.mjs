import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildRecentWorkLaunchHref,
    createRecentWorkLaunchContext,
    resolveRecentWorkDocument,
    WORKSPACE_LAUNCH_CONTEXT_VERSION,
    resolveWorkspaceLaunchContextFromSearchParams,
} from '../index.js';

test('recent work launch resolves the active document when it exists in the registry', () => {
    const recentDocument = resolveRecentWorkDocument({
        activeDocumentId: 'doc.b',
        recentDocuments: [
            { id: 'doc.a', name: 'A', modeId: 'graphic', updatedAt: 10 },
            { id: 'doc.b', name: 'B', modeId: 'uiux', updatedAt: 1 },
        ],
    });

    assert.deepEqual(recentDocument, {
        documentId: 'doc.b',
        name: 'B',
        workspaceId: null,
        modeId: 'uiux',
        updatedAt: 1,
    });
});

test('recent work launch falls back to the most recently updated document deterministically', () => {
    const recentDocument = resolveRecentWorkDocument({
        activeDocumentId: 'doc.missing',
        recentDocuments: [
            { id: 'doc.a', name: 'A', modeId: 'graphic', updatedAt: 5 },
            { id: 'doc.c', name: 'C', modeId: 'tokens', updatedAt: 5 },
            { id: 'doc.b', name: 'B', modeId: 'uiux', updatedAt: 9 },
        ],
    });

    assert.equal(recentDocument?.documentId, 'doc.b');
});

test('recent work launch context resolves canonical create intent from persisted mode identity', () => {
    assert.deepEqual(
        createRecentWorkLaunchContext({
            id: 'doc.uiux',
            modeId: 'uiux',
        }),
        {
            version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
            language: 'uiux',
            category: null,
            blueprint: null,
            template: null,
            grammar: 'create',
            certification: null,
        },
    );
});

test('recent work launch href transports document continuity and canonical launch context together', () => {
    const href = buildRecentWorkLaunchHref({
        activeDocumentId: 'doc.uiux',
        recentDocuments: [
            { id: 'doc.logic', name: 'Logic Flow', modeId: 'logic', updatedAt: 1 },
            { id: 'doc.uiux', name: 'UIUX Flow', modeId: 'uiux', updatedAt: 10 },
        ],
    });
    const url = new URL(href, 'https://dropple.test');

    assert.equal(url.pathname, '/workspace/new');
    assert.equal(url.searchParams.get('doc'), 'doc.uiux');
    assert.equal(url.searchParams.get('launchContextVersion'), String(WORKSPACE_LAUNCH_CONTEXT_VERSION));
    assert.equal(url.searchParams.get('language'), 'uiux');
    assert.equal(url.searchParams.get('grammar'), 'create');

    assert.deepEqual(resolveWorkspaceLaunchContextFromSearchParams(url.searchParams), {
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: 'uiux',
        category: null,
        blueprint: null,
        template: null,
        grammar: 'create',
        certification: null,
    });
});

test('recent work launch preserves continuity when older documents lack persisted workspace truth', () => {
    const href = buildRecentWorkLaunchHref({
        activeDocumentId: 'doc.legacy',
        recentDocuments: [{ id: 'doc.legacy', name: 'Legacy Document', updatedAt: 10 }],
    });
    const url = new URL(href, 'https://dropple.test');

    assert.equal(url.pathname, '/workspace/new');
    assert.equal(url.searchParams.get('doc'), 'doc.legacy');
    assert.equal(url.searchParams.get('language'), null);
    assert.equal(url.searchParams.get('grammar'), null);
});

test('recent work launch fails closed when no resumable document exists', () => {
    assert.equal(buildRecentWorkLaunchHref(), '/workspace/overview');
    assert.equal(createRecentWorkLaunchContext(null), null);
});
