import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveProjectWorldAnchor } from '@/runtime/workspaces/projectWorldAnchor.js';

test('project world anchor resolves deterministic project, activity, and focus summaries', () => {
    const left = resolveProjectWorldAnchor({
        projectName: 'Pelican Express',
        perspectiveLabel: 'Build',
        entryLabel: 'Application',
        focusedUniverseItem: Object.freeze({
            label: 'Operate',
            subtitle: '2 artifacts · Dispatch Board',
        }),
        artifactCount: 7,
    });
    const right = resolveProjectWorldAnchor({
        projectName: 'Pelican Express',
        perspectiveLabel: 'Build',
        entryLabel: 'Application',
        focusedUniverseItem: Object.freeze({
            label: 'Operate',
            subtitle: '2 artifacts · Dispatch Board',
        }),
        artifactCount: 7,
    });

    assert.deepEqual(left, right);
    assert.deepEqual(
        left,
        Object.freeze({
            projectLabel: 'Pelican Express',
            activityLabel: 'Build / Application',
            focusLabel: 'Operate',
            focusSubtitle: '2 artifacts · Dispatch Board',
            projectSummary: 'Pelican Express · Build',
        }),
    );
});

test('project world anchor fails closed to project hub when focus context is absent', () => {
    const anchor = resolveProjectWorldAnchor({
        projectName: '',
        perspectiveLabel: 'Create',
        entryLabel: 'UI / UX',
        focusedUniverseItem: null,
        artifactCount: 2,
    });

    assert.deepEqual(
        anchor,
        Object.freeze({
            projectLabel: 'Untitled Project',
            activityLabel: 'Create / UI / UX',
            focusLabel: 'Project Hub',
            focusSubtitle: '2 artifacts in this project world',
            projectSummary: 'Untitled Project · Create',
        }),
    );
});
