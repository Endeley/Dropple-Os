import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProjectUniverseWorkflowGuide } from '@/runtime/workspaces/projectUniverseWorkflowGuide.js';

test('project universe workflow guide stays deterministic for build handoff guidance', () => {
    const orientation = Object.freeze({
        priorityTargets: Object.freeze([
            Object.freeze({
                targetId: 'group:operate',
                targetType: 'group',
                perspectiveId: 'operate',
                label: 'Operate',
                prioritySummary: 'Priority path: Operates Operate',
            }),
        ]),
        relatedTargets: Object.freeze([]),
        nextTargets: Object.freeze([
            Object.freeze({
                targetId: 'group:operate',
                label: 'Operate',
                subtitle: '1 artifact',
            }),
        ]),
        returnTarget: null,
    });

    const buildWorkflow = Object.freeze({
        suggestedNextArtifact: Object.freeze({
            targetId: 'system:model',
            entryId: 'application',
            label: 'System Model',
            href: '/workspace/build?entry=application&u=system%3Amodel',
        }),
        operateHandoff: Object.freeze({
            entryId: 'systems-engineering',
            label: 'System Model',
            href: '/workspace/operate?entry=systems-engineering&u=system%3Amodel',
        }),
        worldSummary: Object.freeze({
            activityLabel: 'Application',
            activeArtifactLabel: 'System Model',
            summaryLabel: '2 linked build artifacts',
        }),
    });

    const left = buildProjectUniverseWorkflowGuide({
        perspectiveId: 'build',
        entryId: 'application',
        orientation,
        buildWorkflow,
    });
    const right = buildProjectUniverseWorkflowGuide({
        perspectiveId: 'build',
        entryId: 'application',
        orientation,
        buildWorkflow,
    });

    assert.deepEqual(left, right);
    assert.equal(left.activityLabel, 'Application');
    assert.equal(left.currentTaskLabel, 'System Model');
    assert.equal(left.primarySuggestionLabel, 'Operate');
    assert.equal(left.primarySuggestionReason, 'Priority path: Operates Operate');
    assert.equal(left.primarySuggestionReadableReason, 'Operates Operate');
    assert.equal(left.primarySuggestionSourceLabel, 'From project world');
    assert.equal(left.suggestions.length, 3);
    assert.equal(left.suggestions[0].source, 'priority');
    assert.equal(left.suggestions[0].readableReason, 'Operates Operate');
    assert.equal(left.suggestions[0].sourceLabel, 'From project world');
    assert.equal(left.suggestions[0].perspectiveId, 'operate');
    assert.equal(left.suggestions[1].perspectiveId, 'build');
    assert.equal(left.suggestions[2].perspectiveId, 'operate');
    assert.equal(left.suggestions[2].entryId, 'systems-engineering');
});

test('project universe workflow guide falls back to orientation targets when perspective workflow is sparse', () => {
    const guide = buildProjectUniverseWorkflowGuide({
        perspectiveId: 'operate',
        entryId: 'automation',
        orientation: Object.freeze({
            priorityTargets: Object.freeze([
                Object.freeze({
                    targetId: 'group:build',
                    targetType: 'group',
                    perspectiveId: 'build',
                    label: 'Build',
                    prioritySummary: 'Priority path: Depends on Build',
                }),
            ]),
            dependencyTargets: Object.freeze([
                Object.freeze({
                    targetId: 'group:build',
                    label: 'Build',
                    relationshipSummary: 'Depends on Build',
                }),
            ]),
            downstreamTargets: Object.freeze([
                Object.freeze({
                    targetId: 'group:publish',
                    label: 'Publish',
                    relationshipSummary: 'Operates Publish',
                }),
            ]),
            relatedTargets: Object.freeze([
                Object.freeze({
                    targetId: 'workflow:ops',
                    label: 'Operations Workflow',
                    subtitle: 'workflow',
                }),
            ]),
            nextTargets: Object.freeze([
                Object.freeze({
                    targetId: 'group:publish',
                    label: 'Publish',
                    subtitle: '1 artifact',
                }),
            ]),
            returnTarget: Object.freeze({
                targetId: 'project:hub',
                label: 'Project Hub',
                subtitle: 'project world',
            }),
        }),
        operateWorldSummary: Object.freeze({
            activityLabel: 'Automation',
            currentTaskLabel: 'System Model',
            summaryLabel: '1 linked operate target',
        }),
    });

    assert.equal(guide.activityLabel, 'Automation');
    assert.equal(guide.currentTaskLabel, 'System Model');
    assert.equal(guide.primarySuggestionLabel, 'Build');
    assert.equal(guide.primarySuggestionReason, 'Priority path: Depends on Build');
    assert.equal(guide.primarySuggestionReadableReason, 'Depends on Build');
    assert.equal(guide.primarySuggestionSourceLabel, 'From project world');
    assert.equal(guide.suggestions.length, 3);
    assert.equal(guide.suggestions[0].targetId, 'group:build');
    assert.equal(guide.suggestions[0].source, 'priority');
    assert.equal(guide.suggestions[0].readableReason, 'Depends on Build');
    assert.equal(guide.suggestions[1].targetId, 'workflow:ops');
    assert.equal(guide.suggestions[2].targetId, 'group:publish');
    assert.equal(guide.suggestions[2].reason, 'Operates Publish');
});
