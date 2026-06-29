import test from 'node:test';
import assert from 'node:assert/strict';

import {
    UIUX_LANGUAGE_DICTIONARY,
    UIUX_LANGUAGE_ORDER,
    getUIUXCreationEntries,
    resolveUIUXCreativeScenario,
    getUIUXLanguageDefinition,
} from '../uiuxLanguageDictionary.js';

test('uiux language dictionary exposes canonical artifact order', () => {
    assert.deepEqual(UIUX_LANGUAGE_ORDER, ['frame', 'text', 'image', 'container', 'button', 'section', 'component']);
    assert.equal(Object.keys(UIUX_LANGUAGE_DICTIONARY).length, UIUX_LANGUAGE_ORDER.length);
});

test('frame definition describes page-like meaning and evolution', () => {
    const frame = getUIUXLanguageDefinition('frame');

    assert.equal(frame.concept, 'Page / Screen');
    assert.equal(frame.identity, 'Page');
    assert.equal(frame.meaning, 'It belongs to your Application.');
    assert.equal(frame.parentGrammar, 'Page');
    assert.deepEqual(frame.allowedChildren, ['section', 'container', 'component', 'text', 'image', 'button']);
    assert.equal(frame.capabilityDomains.includes('Layout'), true);
    assert.equal(frame.evolvesInto.includes('Dashboard'), true);
    assert.deepEqual(frame.momentum.default, [
        'Define page purpose',
        'Establish content hierarchy',
        'Introduce primary action',
        'Organize page structure',
    ]);
    assert.deepEqual(frame.nextMeaningfulSteps, frame.momentum.default);
    assert.equal(frame.creation.visible, true);
    assert.equal(frame.creation.toolId, 'frame');
});

test('frame definition resolves scenario-shaped momentum from creative intent', () => {
    const frame = getUIUXLanguageDefinition('frame', { scenario: 'login' });

    assert.equal(frame.activeScenario, 'login');
    assert.deepEqual(frame.nextMeaningfulSteps, [
        'Create Authentication Form',
        'Add Brand Identity',
        'Add Primary Action',
        'Provide Recovery Path',
    ]);
});

test('frame definition infers scenario momentum from node context when available', () => {
    const frame = getUIUXLanguageDefinition('frame', {
        node: {
            type: 'frame',
            name: 'Dashboard',
        },
    });

    assert.equal(frame.activeScenario, 'dashboard');
    assert.deepEqual(frame.nextMeaningfulSteps, [
        'Create Navigation',
        'Add Metrics Overview',
        'Create Data Cards',
        'Organize Information Hierarchy',
    ]);
});

test('creative scenario resolver recognizes spaced landing-page labels', () => {
    const frame = getUIUXLanguageDefinition('frame', {
        node: {
            type: 'frame',
            name: 'Landing Page',
        },
    });

    assert.equal(frame.activeScenario, 'landingPage');
    assert.deepEqual(frame.nextMeaningfulSteps, [
        'Create Hero Section',
        'Introduce Brand Identity',
        'Add Primary Call To Action',
        'Create Feature Sections',
    ]);
});

test('creative scenario resolver is fail-closed for unknown intent', () => {
    assert.equal(resolveUIUXCreativeScenario('pricing'), null);
    assert.equal(resolveUIUXCreativeScenario({ name: 'Untitled Frame' }), null);
});

test('creation entries only expose currently available uiux tools', () => {
    const entries = getUIUXCreationEntries({
        availableToolIds: ['frame', 'text', 'image', 'shape', 'path'],
    });

    assert.deepEqual(
        entries.map((entry) => entry.id),
        ['frame', 'text', 'image'],
    );
});
