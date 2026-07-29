import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildHomepageLanguageLaunchHref,
    createHomepageLanguageLaunchContext,
    WORKSPACE_LAUNCH_CONTEXT_VERSION,
    resolveWorkspaceLaunchContextFromSearchParams,
} from '../index.js';

test('homepage language launch context resolves deterministic create intent', () => {
    assert.deepEqual(createHomepageLanguageLaunchContext('uiux'), {
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: 'uiux',
        category: null,
        blueprint: null,
        template: null,
        grammar: 'create',
        certification: null,
    });
});

test('homepage language launch href transports canonical launch context deterministically', () => {
    const href = buildHomepageLanguageLaunchHref('graphic');
    const url = new URL(href, 'https://dropple.test');

    assert.equal(url.pathname, '/workspace/graphic');
    assert.equal(url.searchParams.get('launchContextVersion'), String(WORKSPACE_LAUNCH_CONTEXT_VERSION));
    assert.equal(url.searchParams.get('language'), 'graphic');
    assert.equal(url.searchParams.get('grammar'), 'create');

    assert.deepEqual(resolveWorkspaceLaunchContextFromSearchParams(url.searchParams), {
        version: WORKSPACE_LAUNCH_CONTEXT_VERSION,
        language: 'graphic',
        category: null,
        blueprint: null,
        template: null,
        grammar: 'create',
        certification: null,
    });
});

test('homepage language launch href fails closed when mode id is missing', () => {
    assert.equal(buildHomepageLanguageLaunchHref(''), '/workspace');
    assert.equal(createHomepageLanguageLaunchContext(''), null);
});
