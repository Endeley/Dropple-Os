import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGraphicCompositionProjection } from '../graphicCompositionProjection.js';

test('graphic composition projection resolves communication direction into a composition identity', () => {
    const composition = resolveGraphicCompositionProjection('poster');

    assert.equal(composition.title, 'Poster Composition');
    assert.match(composition.meaning, /Composition owns/i);
    assert.ok(Array.isArray(composition.nextMeaningfulSteps));
    assert.ok(composition.nextMeaningfulSteps.includes('Clarify the focal message'));
});

test('graphic composition projection exposes capability domains before first expression', () => {
    const composition = resolveGraphicCompositionProjection('brandBoard');

    assert.deepEqual(composition.capabilityDomains, ['Brand', 'Typography', 'Color', 'Relationships']);
    assert.match(composition.ownership, /future expressions/i);
});

test('graphic composition projection fails closed to poster composition', () => {
    const composition = resolveGraphicCompositionProjection('unknown-direction');

    assert.equal(composition.starterId, 'poster');
    assert.equal(composition.title, 'Poster Composition');
});
