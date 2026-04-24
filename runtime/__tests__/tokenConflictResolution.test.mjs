import test from 'node:test';
import assert from 'node:assert/strict';

import { projectTokenConflictResolutions } from '@/runtime/tokens/projectTokenConflictResolutions.js';
import { selectActiveConflictResolution } from '@/runtime/tokens/selectActiveConflictResolution.js';

function createMergePreview() {
    return {
        leftVersionId: 'v2',
        rightVersionId: 'v3',
        commonAncestorId: 'v1',
        incomingChanges: Object.freeze([
            Object.freeze({
                entityKey: 'color.secondary',
                label: 'color.secondary',
                impact: 'additive',
                right: { next: '#444444', side: 'right' },
            }),
        ]),
        overlappingChanges: Object.freeze([
            Object.freeze({
                entityKey: 'color.primary',
                label: 'color.primary',
                impact: 'cosmetic',
                left: { kind: 'value', next: '#222222' },
                right: { kind: 'value', next: '#333333' },
            }),
            Object.freeze({
                entityKey: 'color.brand',
                label: 'color.brand',
                impact: 'breaking',
                left: { kind: 'alias', next: 'color.primary' },
                right: { kind: 'alias', next: 'color.secondary' },
            }),
        ]),
        conflicts: Object.freeze([
            Object.freeze({
                entityKey: 'color.primary',
                label: 'color.primary',
                impact: 'cosmetic',
                left: { kind: 'value', next: '#222222' },
                right: { kind: 'value', next: '#333333' },
            }),
            Object.freeze({
                entityKey: 'color.brand',
                label: 'color.brand',
                impact: 'breaking',
                left: { kind: 'alias', next: 'color.primary' },
                right: { kind: 'alias', next: 'color.secondary' },
            }),
        ]),
        autoMergeable: Object.freeze([
            Object.freeze({
                entityKey: 'color.secondary',
                label: 'color.secondary',
                impact: 'additive',
                right: { side: 'right', next: '#444444' },
            }),
        ]),
        impactSummary: Object.freeze({
            breaking: 1,
            additive: 1,
            cosmetic: 1,
        }),
    };
}

test('token conflict resolution projects deterministic resolved values and unresolved count', () => {
    const projected = projectTokenConflictResolutions({
        mergePreview: createMergePreview(),
        selectedResolutionChoices: {
            'color.primary': {
                choice: 'keep-left',
            },
            'color.brand': {
                choice: 'alias-rebind',
                manualTargetPath: 'color.accent',
            },
        },
    });

    assert.equal(projected.unresolvedCount, 0);
    assert.deepEqual(
        projected.predictedMergedResult.map((entry) => entry.entityKey),
        ['color.brand', 'color.primary', 'color.secondary'],
    );
    assert.deepEqual(projected.impactSummary, {
        breaking: 1,
        additive: 1,
        cosmetic: 1,
    });
});

test('token conflict resolution keeps unresolved conflicts blocked until all choices are complete', () => {
    const projected = projectTokenConflictResolutions({
        mergePreview: createMergePreview(),
        selectedResolutionChoices: {
            'color.primary': {
                choice: 'manual-merged-value',
                manualValue: '',
            },
        },
    });

    assert.equal(projected.unresolvedCount, 2);
    assert.equal(projected.predictedMergedResult.length, 1);
});

test('active conflict resolution selector composes merge preview with local selections without mutation', () => {
    const state = {
        document: {
            tokenVersions: {
                entries: {},
                order: [],
                activeVersionId: null,
            },
        },
        events: [],
    };
    const mergePreview = createMergePreview();
    const before = JSON.stringify(mergePreview);

    const projected = selectActiveConflictResolution(state, {
        mergePreview,
        selectedResolutionChoices: {
            'color.primary': { choice: 'keep-right' },
            'color.brand': { choice: 'keep-left' },
        },
    });

    assert.equal(projected.unresolvedCount, 0);
    assert.equal(JSON.stringify(mergePreview), before);
});
