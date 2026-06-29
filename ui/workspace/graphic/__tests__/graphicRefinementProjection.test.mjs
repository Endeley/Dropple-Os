import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGraphicRefinementProjection } from '../graphicRefinementProjection.js';

const ARTBOARD = Object.freeze({
    id: 'artboard-1',
    type: 'frame',
    parentId: null,
    metadata: Object.freeze({
        graphicArtifactRole: 'artboard',
        graphicFirstExpression: true,
        graphicCompositionTitle: 'Poster Composition',
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

const SUPPORTING_IMAGE = Object.freeze({
    id: 'image-1',
    type: 'image',
    parentId: 'artboard-1',
    metadata: Object.freeze({
        graphicVocabularyMeaning: 'supportingImage',
        graphicSemanticRole: 'supporting-image',
    }),
});

test('graphic refinement projection appears once expressive vocabulary exists', () => {
    const projection = resolveGraphicRefinementProjection(MESSAGE, {
        'artboard-1': ARTBOARD,
        'text-1': MESSAGE,
    });

    assert.equal(projection.compositionTitle, 'Poster Composition');
    assert.equal(projection.primaryMeaning, 'message');
    assert.equal(projection.expressiveCount, 1);
    assert.match(projection.title, /message communicate more clearly/i);
    assert.ok(
        projection.relationshipPrompts.some((entry) => /focal point|focal/i.test(entry) || /message/i.test(entry)),
    );
});

test('graphic refinement projection can derive refinement from the selected artboard', () => {
    const projection = resolveGraphicRefinementProjection(ARTBOARD, {
        'artboard-1': ARTBOARD,
        'text-1': MESSAGE,
        'image-1': SUPPORTING_IMAGE,
    });

    assert.equal(projection.primaryMeaning, 'supportingImage');
    assert.equal(projection.expressiveCount, 2);
    assert.match(projection.subtitle, /before reaching for more control/i);
});

test('graphic refinement projection stays hidden when no expressive vocabulary exists', () => {
    assert.equal(
        resolveGraphicRefinementProjection(ARTBOARD, {
            'artboard-1': ARTBOARD,
        }),
        null,
    );
});

