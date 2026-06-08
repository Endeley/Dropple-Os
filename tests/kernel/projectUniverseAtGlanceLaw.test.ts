import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProjectUniverseAtGlance } from '@/runtime/workspaces/projectUniverseAtGlance.js';

test('project universe at-a-glance summary is deterministic and fail-closed', () => {
    const universe = Object.freeze({
        hubId: 'project:hub',
        nodes: Object.freeze({
            'project:hub': Object.freeze({ id: 'project:hub', label: 'Hub' }),
            'frame:dispatch': Object.freeze({ id: 'frame:dispatch', label: 'Dispatch Board' }),
            'workflow:publish': Object.freeze({ id: 'workflow:publish', label: 'Publish Targets' }),
        }),
        groups: Object.freeze({
            'group:create': Object.freeze({ id: 'group:create', label: 'Create' }),
            'group:build': Object.freeze({ id: 'group:build', label: 'Build' }),
        }),
    });

    const orientation = Object.freeze({
        dependencyTargets: Object.freeze([
            Object.freeze({ targetId: 'group:create', label: 'Create' }),
        ]),
        downstreamTargets: Object.freeze([
            Object.freeze({ targetId: 'group:publish', label: 'Publish' }),
        ]),
    });

    const workflowGuide = Object.freeze({
        currentTaskLabel: 'Dispatch Board',
        primarySuggestionLabel: 'Publish',
    });

    const left = buildProjectUniverseAtGlance({ universe, orientation, workflowGuide });
    const right = buildProjectUniverseAtGlance({ universe, orientation, workflowGuide });

    assert.deepEqual(left, right);
    assert.equal(left.existsLabel, 'Build, Create · 2 artifacts');
    assert.equal(left.activeLabel, 'Dispatch Board');
    assert.equal(left.nextLabel, 'Publish');
    assert.equal(left.blockedLabel, 'Waiting on Create');
    assert.equal(left.doneLabel, 'Ready for Publish');
    assert.equal(left.roomCount, 2);
    assert.equal(left.artifactCount, 2);
});

test('project universe at-a-glance reports clear empty-state summaries when no dependencies are visible', () => {
    const glance = buildProjectUniverseAtGlance({
        universe: Object.freeze({
            hubId: 'project:hub',
            nodes: Object.freeze({
                'project:hub': Object.freeze({ id: 'project:hub', label: 'Hub' }),
            }),
            groups: Object.freeze({}),
        }),
        orientation: Object.freeze({
            dependencyTargets: Object.freeze([]),
            downstreamTargets: Object.freeze([]),
        }),
        workflowGuide: Object.freeze({}),
    });

    assert.equal(glance.existsLabel, 'Project world · 0 artifacts');
    assert.equal(glance.activeLabel, 'Awaiting project focus');
    assert.equal(glance.nextLabel, 'Project Hub');
    assert.equal(glance.blockedLabel, 'No blockers visible');
    assert.equal(glance.doneLabel, 'Nothing marked done yet');
});
