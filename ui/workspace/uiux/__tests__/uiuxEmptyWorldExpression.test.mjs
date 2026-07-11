import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildUIUXEmptyWorldCreateIntent,
    buildUIUXEmptyWorldSelectionIntent,
    buildUIUXEmptyWorldStarterActivation,
    getUIUXEmptyWorldStarters,
    shouldShowUIUXEmptyWorld,
} from '../uiuxEmptyWorldExpression.js';

test('uiux empty world starters stay deterministic and scenario-shaped', () => {
    const left = getUIUXEmptyWorldStarters();
    const right = getUIUXEmptyWorldStarters();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left.map((starter) => starter.id),
        ['blankPage', 'landingPage', 'dashboard', 'login', 'settings'],
    );
    assert.deepEqual(
        left.map((starter) => starter.label),
        [
            'Something new',
            'A public-facing experience',
            'An operations surface',
            'An access experience',
            'A control surface',
        ],
    );
    assert.deepEqual(
        left.map((starter) => starter.description),
        [
            'Start from a flexible idea and let the structure appear as you shape it.',
            'Bring a message, offer, or product story into a focused experience.',
            'Shape a place where people read signals, monitor activity, and act.',
            'Design the moment someone enters, verifies identity, or regains access.',
            'Give people a place to manage preferences, account rules, and system choices.',
        ],
    );
});

test('uiux empty world only appears before the first page and stays hidden once world history exists', () => {
    assert.equal(
        shouldShowUIUXEmptyWorld({
            workspaceId: 'uiux',
            nodeCount: 0,
            worldHistory: null,
        }),
        true,
    );

    assert.equal(
        shouldShowUIUXEmptyWorld({
            workspaceId: 'uiux',
            nodeCount: 1,
            worldHistory: null,
        }),
        false,
    );

    assert.equal(
        shouldShowUIUXEmptyWorld({
            workspaceId: 'uiux',
            nodeCount: 0,
            worldHistory: {
                firstRememberedArtifact: {
                    nodeId: 'frame-a',
                },
            },
        }),
        false,
    );
});

test('uiux empty world starter intents stay on the canonical frame creation path and attach scenario metadata when declared', () => {
    assert.deepEqual(buildUIUXEmptyWorldCreateIntent('blankPage'), {
        id: null,
        type: 'frame',
        name: 'Blank Page',
        props: undefined,
        metadata: {
            uiuxStarterId: 'blankPage',
            uiuxFirstExpression: true,
        },
    });

    assert.deepEqual(buildUIUXEmptyWorldCreateIntent('landingPage'), {
        id: null,
        type: 'frame',
        name: 'Landing Page',
        props: {
            scenario: 'landingPage',
        },
        metadata: {
            uiuxStarterId: 'landingPage',
            uiuxFirstExpression: true,
            scenario: 'landingPage',
        },
    });

    assert.deepEqual(buildUIUXEmptyWorldCreateIntent('dashboard'), {
        id: null,
        type: 'frame',
        name: 'Dashboard',
        props: {
            scenario: 'dashboard',
        },
        metadata: {
            uiuxStarterId: 'dashboard',
            uiuxFirstExpression: true,
            scenario: 'dashboard',
        },
    });

    assert.deepEqual(buildUIUXEmptyWorldCreateIntent('login'), {
        id: null,
        type: 'frame',
        name: 'Login Screen',
        props: {
            scenario: 'login',
        },
        metadata: {
            uiuxStarterId: 'login',
            uiuxFirstExpression: true,
            scenario: 'login',
        },
    });

    assert.deepEqual(buildUIUXEmptyWorldCreateIntent('settings'), {
        id: null,
        type: 'frame',
        name: 'Settings Page',
        props: {
            scenario: 'settings',
        },
        metadata: {
            uiuxStarterId: 'settings',
            uiuxFirstExpression: true,
            scenario: 'settings',
        },
    });
});

test('uiux empty world can activate a newly created page through the canonical selection path', () => {
    const activation = buildUIUXEmptyWorldStarterActivation('landingPage');

    assert.equal(typeof activation.nodeId, 'string');
    assert.equal(activation.nodeId.startsWith('frame-'), true);
    assert.deepEqual(activation.createIntent, {
        id: activation.nodeId,
        type: 'frame',
        name: 'Landing Page',
        props: {
            scenario: 'landingPage',
        },
        metadata: {
            uiuxStarterId: 'landingPage',
            uiuxFirstExpression: true,
            scenario: 'landingPage',
        },
    });
    assert.deepEqual(activation.selectionIntent, {
        ids: [activation.nodeId],
        primary: activation.nodeId,
    });
});

test('uiux empty world selection intent fails closed without a node id', () => {
    assert.equal(buildUIUXEmptyWorldSelectionIntent(null), null);
    assert.equal(buildUIUXEmptyWorldSelectionIntent(''), null);
});
