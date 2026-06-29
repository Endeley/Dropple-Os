import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGraphicDeliveryProjection } from '../graphicDeliveryProjection.js';

const ARTBOARD = Object.freeze({
    id: 'artboard-1',
    type: 'frame',
    parentId: null,
    metadata: Object.freeze({
        graphicArtifactRole: 'artboard',
        graphicFirstExpression: true,
        graphicCompositionTitle: 'Poster Composition',
        graphicStarterId: 'poster',
    }),
});

const MESSAGE = Object.freeze({
    id: 'text-1',
    type: 'text',
    parentId: 'artboard-1',
    metadata: Object.freeze({
        graphicVocabularyMeaning: 'message',
        graphicSemanticRole: 'message',
    }),
});

const IMAGE = Object.freeze({
    id: 'image-1',
    type: 'image',
    parentId: 'artboard-1',
    metadata: Object.freeze({
        graphicVocabularyMeaning: 'supportingImage',
        graphicSemanticRole: 'supporting-image',
    }),
});

test('graphic delivery projection appears after expressive vocabulary exists', () => {
    const projection = resolveGraphicDeliveryProjection(MESSAGE, {
        'artboard-1': ARTBOARD,
        'text-1': MESSAGE,
    });

    assert.equal(projection.compositionTitle, 'Poster Composition');
    assert.equal(projection.expressiveCount, 1);
    assert.equal(projection.audiences[0].id, 'clientReview');
    assert.match(projection.subtitle, /before choosing a format/i);
});

test('graphic delivery projection stays hidden until expressive vocabulary exists', () => {
    assert.equal(
        resolveGraphicDeliveryProjection(ARTBOARD, {
            'artboard-1': ARTBOARD,
        }),
        null,
    );
});
