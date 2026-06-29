import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildGraphicFirstExpressionActivation,
    buildGraphicFirstExpressionCreateIntent,
    buildGraphicFirstExpressionSelectionIntent,
} from '../graphicFirstExpressionActivation.js';

test('graphic first expression create intent produces an Artboard-shaped lawful frame intent', () => {
    const intent = buildGraphicFirstExpressionCreateIntent('poster', { id: 'artboard-1' });

    assert.equal(intent.id, 'artboard-1');
    assert.equal(intent.type, 'frame');
    assert.equal(intent.name, 'Poster Artboard');
    assert.deepEqual(intent.bounds, {
        x: -192,
        y: -144,
        width: 1440,
        height: 1024,
    });
    assert.equal(intent.metadata.graphicArtifactRole, 'artboard');
    assert.equal(intent.metadata.graphicFirstExpression, true);
    assert.equal(intent.metadata.graphicCompositionTitle, 'Poster Composition');
});

test('graphic first expression selection intent remains canonical and deterministic', () => {
    const intent = buildGraphicFirstExpressionSelectionIntent('artboard-1');

    assert.deepEqual(intent, {
        ids: ['artboard-1'],
        primary: 'artboard-1',
    });
});

test('graphic first expression activation couples creation with immediate lawful selection', () => {
    const activation = buildGraphicFirstExpressionActivation('socialGraphic');

    assert.match(activation.nodeId, /^artboard-/);
    assert.equal(activation.createIntent.id, activation.nodeId);
    assert.equal(activation.createIntent.name, 'Social Graphic Artboard');
    assert.deepEqual(activation.selectionIntent, {
        ids: [activation.nodeId],
        primary: activation.nodeId,
    });
});
