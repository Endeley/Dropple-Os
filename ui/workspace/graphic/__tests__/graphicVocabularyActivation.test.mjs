import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildGraphicVocabularyActivation,
    buildGraphicVocabularyCreateIntent,
    buildGraphicVocabularySelectionIntent,
    getGraphicVocabularyMeanings,
} from '../graphicVocabularyActivation.js';

const ARTBOARD = Object.freeze({
    id: 'artboard-1',
    layout: Object.freeze({
        x: -192,
        y: -144,
        width: 1440,
        height: 1024,
    }),
});

test('graphic vocabulary meanings stay meaning-first and deterministic', () => {
    assert.deepEqual(
        getGraphicVocabularyMeanings().map((entry) => entry.id),
        ['message', 'visualForm', 'supportingImage', 'brandElement'],
    );
});

test('graphic vocabulary create intent resolves meaning into lawful node creation intent', () => {
    const intent = buildGraphicVocabularyCreateIntent('message', ARTBOARD, { id: 'text-1' });

    assert.equal(intent.id, 'text-1');
    assert.equal(intent.type, 'text');
    assert.equal(intent.parentId, 'artboard-1');
    assert.equal(intent.content, 'Your message');
    assert.equal(intent.metadata.graphicSemanticRole, 'message');
    assert.deepEqual(intent.bounds, {
        x: -72,
        y: -24,
        width: 520,
        height: 88,
    });
});

test('graphic vocabulary selection intent remains canonical', () => {
    assert.deepEqual(buildGraphicVocabularySelectionIntent('shape-1'), {
        ids: ['shape-1'],
        primary: 'shape-1',
    });
});

test('graphic vocabulary activation couples meaning-first choice to lawful selection', () => {
    const activation = buildGraphicVocabularyActivation('supportingImage', ARTBOARD);

    assert.match(activation.nodeId, /^image-/);
    assert.equal(activation.meaning, 'supportingImage');
    assert.equal(activation.createIntent.type, 'image');
    assert.equal(activation.createIntent.parentId, 'artboard-1');
    assert.deepEqual(activation.selectionIntent, {
        ids: [activation.nodeId],
        primary: activation.nodeId,
    });
});
