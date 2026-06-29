import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getGraphicEmptyWorldStarters,
    resolveGraphicEmptyWorldStarter,
    shouldShowGraphicEmptyWorld,
} from '../graphicEmptyWorldExpression.js';

test('graphic empty world starters stay deterministic and communication-oriented', () => {
    const left = getGraphicEmptyWorldStarters();
    const right = getGraphicEmptyWorldStarters();

    assert.deepEqual(left, right);
    assert.deepEqual(
        left.map((starter) => starter.id),
        ['poster', 'socialGraphic', 'brandBoard', 'logoSheet', 'flyer', 'presentationCover'],
    );
    assert.deepEqual(
        left.map((starter) => starter.label),
        ['Poster', 'Social Graphic', 'Brand Board', 'Logo Sheet', 'Flyer', 'Presentation Cover'],
    );
    assert.deepEqual(
        left.map((starter) => starter.compositionLabel),
        [
            'Poster Composition',
            'Social Graphic Composition',
            'Brand Board Composition',
            'Logo Sheet Composition',
            'Flyer Composition',
            'Presentation Cover Composition',
        ],
    );
});

test('graphic empty world only appears for empty graphic worlds', () => {
    assert.equal(
        shouldShowGraphicEmptyWorld({
            workspaceId: 'graphic',
            nodeCount: 0,
        }),
        true,
    );

    assert.equal(
        shouldShowGraphicEmptyWorld({
            modeId: 'graphic',
            nodeCount: 0,
        }),
        true,
    );

    assert.equal(
        shouldShowGraphicEmptyWorld({
            workspaceId: 'graphic',
            nodeCount: 1,
        }),
        false,
    );

    assert.equal(
        shouldShowGraphicEmptyWorld({
            workspaceId: 'uiux',
            nodeCount: 0,
        }),
        false,
    );
});

test('graphic empty world resolves starters deterministically and fails closed to poster', () => {
    assert.deepEqual(resolveGraphicEmptyWorldStarter('flyer'), {
        id: 'flyer',
        label: 'Flyer',
        title: 'Flyer',
        description: 'Communicate an offer, event, or announcement in one clear piece.',
        compositionLabel: 'Flyer Composition',
        accent: 'teal',
    });

    assert.deepEqual(resolveGraphicEmptyWorldStarter('unknown'), {
        id: 'poster',
        label: 'Poster',
        title: 'Poster',
        description: 'Promote one message with clear hierarchy and visual impact.',
        compositionLabel: 'Poster Composition',
        accent: 'coral',
    });
});
