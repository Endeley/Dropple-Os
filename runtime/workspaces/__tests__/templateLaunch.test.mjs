import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildTemplateDetailLaunchHref,
    createTemplateDetailLaunchContext,
    WORKSPACE_LAUNCH_CONTEXT_VERSION,
    resolveWorkspaceLaunchContextFromSearchParams,
} from '../index.js';

function createTemplateFixture(overrides = {}) {
    return {
        id: 'tpl.design.hero-motion-template',
        mode: 'uiux',
        versionId: 'tpl.design.hero-motion-template.v3',
        lineageRootId: 'root-template-3',
        certification: {
            certified: true,
            lineageRootId: 'root-template-3',
            lineageNodeId: 'tpl.design.hero-motion-template.v3',
            certificationHash: 'cert-hash-1',
        },
        metadata: {
            category: 'landing-page',
        },
        ...overrides,
    };
}

test('template detail launch context resolves deterministic create intent', () => {
    assert.deepEqual(createTemplateDetailLaunchContext(createTemplateFixture()), {
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: 'uiux',
        category: 'landing-page',
        blueprint: null,
        template: {
            id: 'tpl.design.hero-motion-template',
            versionId: 'tpl.design.hero-motion-template.v3',
        },
        grammar: 'create',
        certification: {
            blueprint: null,
            template: 'dropple-certified',
        },
    });
});

test('template detail launch href transports canonical launch context and preserves only minimal compatibility fields', () => {
    const href = buildTemplateDetailLaunchHref(
        createTemplateFixture({
            mode: 'graphic',
            metadata: {},
        }),
    );
    const url = new URL(href, 'https://dropple.test');

    assert.equal(url.pathname, '/workspace/create');
    assert.equal(url.searchParams.get('entry'), 'graphic');
    assert.equal(url.searchParams.get('lineageRootId'), 'root-template-3');
    assert.equal(url.searchParams.get('overlayId'), null);
    assert.equal(url.searchParams.get('workspaceId'), null);
    assert.equal(url.searchParams.get('modeId'), null);
    assert.equal(url.searchParams.get('versionId'), null);

    assert.equal(url.searchParams.get('launchContextVersion'), String(WORKSPACE_LAUNCH_CONTEXT_VERSION));
    assert.equal(url.searchParams.get('language'), 'graphic');
    assert.equal(url.searchParams.get('template'), 'tpl.design.hero-motion-template');
    assert.equal(url.searchParams.get('templateVersionId'), 'tpl.design.hero-motion-template.v3');
    assert.equal(url.searchParams.get('grammar'), 'create');
    assert.equal(url.searchParams.get('templateCertification'), 'dropple-certified');

    assert.deepEqual(resolveWorkspaceLaunchContextFromSearchParams(url.searchParams), {
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: 'graphic',
        category: null,
        blueprint: null,
        template: {
            id: 'tpl.design.hero-motion-template',
            versionId: 'tpl.design.hero-motion-template.v3',
        },
        grammar: 'create',
        certification: {
            blueprint: null,
            template: 'dropple-certified',
        },
    });
});

test('template detail launch fails closed when lineage identity is incomplete', () => {
    const template = createTemplateFixture({
        versionId: null,
        certification: {
            certified: true,
            lineageRootId: 'root-template-3',
            lineageNodeId: null,
        },
    });

    assert.equal(buildTemplateDetailLaunchHref(template), '/workspace/create');
    assert.equal(createTemplateDetailLaunchContext(template), null);
});
