import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BLUEPRINT_CATEGORIES,
    decorateBlueprintCategory,
    inferBlueprintCategory,
} from '@/marketplace/blueprintCategories.js';

test('blueprint categories remain deterministic and complete', () => {
    assert.deepEqual(
        BLUEPRINT_CATEGORIES.map((category) => category.id),
        ['business', 'creative', 'technology', 'engineering', 'education', 'operations'],
    );
});

test('blueprint category inference classifies logistics and startup entries deterministically', () => {
    assert.equal(
        inferBlueprintCategory({
            id: 'bp.logistics.v1',
            name: 'Logistics Blueprint',
            description: 'Dispatch and warehouse operations',
            workspaceProfiles: { operate: ['enterprise-operations'] },
        }),
        'operations',
    );
    assert.equal(
        inferBlueprintCategory({
            id: 'bp.startup.v2',
            name: 'Startup Blueprint',
            description: 'Launch a business website and app',
            workspaceProfiles: { build: ['application'] },
        }),
        'technology',
    );
});

test('decorate blueprint category adds stable label metadata', () => {
    const decorated = decorateBlueprintCategory({
        id: 'bp.education.v1',
        name: 'Education Blueprint',
        description: 'Course and lesson flow',
    });

    assert.equal(decorated.blueprintCategory, 'education');
    assert.equal(decorated.blueprintCategoryLabel, 'Education');
});
