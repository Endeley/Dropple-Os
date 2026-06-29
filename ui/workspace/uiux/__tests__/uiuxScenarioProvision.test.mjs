import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getUIUXScenarioSourceLabel,
    resolveUIUXScenarioProvision,
    UIUX_SCENARIO_OPTIONS,
} from '../uiuxScenarioProvision.js';

test('uiux scenario provision exposes stable scenario options', () => {
    assert.deepEqual(
        UIUX_SCENARIO_OPTIONS.map((entry) => entry.id),
        ['landingPage', 'dashboard', 'login', 'settings'],
    );
});

test('explicit user selection wins over every other provider', () => {
    const resolved = resolveUIUXScenarioProvision({
        explicitScenario: 'settings',
        node: {
            name: 'Dashboard',
            metadata: { scenario: 'login' },
        },
        document: {
            meta: {
                assistantIntent: { scenario: 'landingPage' },
                template: { scenario: 'dashboard' },
                projectContext: { scenario: 'login' },
            },
        },
        workspaceContext: {
            scenario: 'landingPage',
        },
    });

    assert.equal(resolved.scenario, 'settings');
    assert.equal(resolved.source, 'explicit-user-selection');
});

test('ai-derived intent outranks template and project context', () => {
    const resolved = resolveUIUXScenarioProvision({
        document: {
            meta: {
                assistantIntent: { scenario: 'login' },
                template: { scenario: 'landingPage' },
                projectContext: { scenario: 'dashboard' },
            },
        },
        node: {
            metadata: { scenario: 'settings' },
        },
    });

    assert.equal(resolved.scenario, 'login');
    assert.equal(resolved.source, 'ai-derived-intent');
});

test('template outranks project context and artifact metadata', () => {
    const resolved = resolveUIUXScenarioProvision({
        document: {
            meta: {
                template: { scenario: 'landingPage' },
                projectContext: { scenario: 'dashboard' },
            },
        },
        node: {
            metadata: { scenario: 'settings' },
        },
    });

    assert.equal(resolved.scenario, 'landingPage');
    assert.equal(resolved.source, 'template');
});

test('project context outranks persisted artifact metadata', () => {
    const resolved = resolveUIUXScenarioProvision({
        document: {
            meta: {
                projectContext: { scenario: 'dashboard' },
            },
        },
        node: {
            metadata: { scenario: 'settings' },
        },
    });

    assert.equal(resolved.scenario, 'dashboard');
    assert.equal(resolved.source, 'project-context');
});

test('artifact metadata is used when higher-order providers are absent', () => {
    const resolved = resolveUIUXScenarioProvision({
        node: {
            meta: { scenario: 'login' },
        },
    });

    assert.equal(resolved.scenario, 'login');
    assert.equal(resolved.source, 'persisted-artifact-metadata');
});

test('scenario provision fails closed to default when no declared provider exists', () => {
    const resolved = resolveUIUXScenarioProvision({
        node: {
            name: 'Untitled Frame',
        },
        document: {
            meta: {},
        },
    });

    assert.equal(resolved.scenario, null);
    assert.equal(resolved.source, 'default');
    assert.equal(getUIUXScenarioSourceLabel(resolved.source), 'Default');
});
