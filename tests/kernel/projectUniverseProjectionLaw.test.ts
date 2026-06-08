import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProjectUniverseProjection } from '@/runtime/workspaces/projectUniverseProjection.js';

test('project universe projection derives deterministic artifact nodes from document truth and bootstrap metadata', () => {
    const document = {
        meta: {
            id: 'doc-1',
            name: 'Logistics Control',
            projectBootstrap: {
                projectId: 'project.logistics',
                projectName: 'Logistics Control',
                blueprintId: 'bp.logistics.v1',
                blueprintVersionId: 'bp.logistics.v1',
            },
        },
        sceneGraph: {
            rootIds: ['frame.dispatch', 'frame.ops.root'],
            nodes: {
                'frame.dispatch': { id: 'frame.dispatch', type: 'frame', name: 'Dispatch Board' },
                'frame.ops.root': { id: 'frame.ops.root', type: 'frame', name: 'Operations Root' },
            },
        },
        graphs: {
            routing: {},
        },
        sequences: {
            sequences: {
                timelineA: { id: 'timelineA', name: 'Launch Sequence', clips: [] },
            },
        },
        stateMachines: {
            machines: {
                fulfillment: { id: 'fulfillment', name: 'Fulfillment Machine' },
            },
        },
        components: {
            definitions: { hero: {} },
            instances: { heroA: {} },
        },
        motion: {
            clips: { intro: {} },
        },
        rigs: {
            rigs: { camera: {} },
        },
        app: {
            flows: {
                dispatchApproval: {},
            },
        },
        exports: {
            targets: [{ id: 'web' }],
        },
        variables: {
            region: {},
        },
        bindings: {},
    };

    const left = buildProjectUniverseProjection({
        document,
        projectIdentity: {
            name: 'Logistics Control',
            blueprintId: 'bp.logistics.v1',
        },
    });
    const right = buildProjectUniverseProjection({
        document,
        projectIdentity: {
            name: 'Logistics Control',
            blueprintId: 'bp.logistics.v1',
        },
    });

    assert.equal(left?.hubId, 'project:hub');
    assert.equal(left?.nodes['project:hub']?.label, 'Logistics Control');
    assert.equal(
        left?.nodes['project:hub']?.metadata?.geographySummary,
        'North: Build and Create · South: Operate and Publish · East: Build and Operate · West: Create',
    );
    assert.equal(left?.nodes['document:primary']?.kind, 'document');
    assert.equal(left?.nodes['frame:frame.dispatch']?.kind, 'frame');
    assert.equal(left?.nodes['frame:frame.ops.root']?.label, 'Operations Root');
    assert.equal(left?.nodes['workflow:graph:routing']?.kind, 'workflow');
    assert.equal(left?.nodes['workflow:flow:dispatchApproval']?.kind, 'workflow');
    assert.equal(left?.nodes['sequence:timelineA']?.kind, 'video');
    assert.equal(left?.nodes['state-machine:fulfillment']?.kind, 'state-machine');
    assert.equal(left?.nodes['components:library']?.kind, 'component-library');
    assert.equal(left?.nodes['animation:motion']?.kind, 'animation');
    assert.equal(left?.nodes['system:model']?.kind, 'system-model');
    assert.equal(left?.groups['group:create']?.label, 'Create');
    assert.equal(left?.groups['group:create']?.metadata?.geographyZone, 'north-west');
    assert.equal(left?.groups['group:create']?.metadata?.geographySummary, 'Northwest project region');
    assert.equal(left?.groups['group:create']?.metadata?.artifactCount, 6);
    assert.equal(left?.groups['group:create']?.metadata?.primaryNodeId, 'document:primary');
    assert.equal(left?.groups['group:create']?.metadata?.primaryNodeLabel, 'Logistics Control');
    assert.deepEqual(left?.groups['group:create']?.metadata?.relatedPerspectiveIds, Object.freeze(['build', 'publish']));
    assert.deepEqual(
        left?.groups['group:create']?.metadata?.relationshipTypes,
        Object.freeze({ build: 'produces', publish: 'publishes' }),
    );
    assert.equal(left?.groups['group:create']?.metadata?.relationshipSummary, 'Produces for Build · Publishes to Publish');
    assert.equal(left?.groups['group:create']?.metadata?.prioritySummary, 'Priority path: Produces for Build');
    assert.equal(left?.groups['group:create']?.metadata?.priorityTier, 'supporting');
    assert.equal(left?.groups['group:create']?.metadata?.primaryRelationshipLabel, 'Build');
    assert.equal(left?.groups['group:create']?.metadata?.reliesOnSummary, 'Relies on project hub context');
    assert.equal(left?.groups['group:create']?.metadata?.influencesSummary, 'Influences Build and Publish');
    assert.equal(left?.groups['group:create']?.metadata?.mattersNextSummary, 'Matters next for delivery in Build');
    assert.deepEqual(left?.groups['group:create']?.metadata?.kindCounts, Object.freeze({
        animation: 1,
        'component-library': 1,
        document: 1,
        frame: 2,
        video: 1,
    }));
    assert.deepEqual(left?.groups['group:create']?.nodeIds, Object.freeze([
        'animation:motion',
        'components:library',
        'document:primary',
        'frame:frame.dispatch',
        'frame:frame.ops.root',
        'sequence:timelineA',
    ]));
    assert.equal(left?.groups['group:build']?.label, 'Build');
    assert.equal(left?.groups['group:build']?.metadata?.geographyZone, 'north-east');
    assert.equal(left?.groups['group:build']?.metadata?.primaryNodeId, 'workflow:flow:dispatchApproval');
    assert.deepEqual(left?.groups['group:build']?.metadata?.relatedPerspectiveIds, Object.freeze(['create', 'operate', 'publish']));
    assert.deepEqual(
        left?.groups['group:build']?.metadata?.relationshipTypes,
        Object.freeze({ create: 'depends-on', operate: 'operates', publish: 'produces' }),
    );
    assert.equal(
        left?.groups['group:build']?.metadata?.relationshipSummary,
        'Depends on Create · Operates Operate · Produces for Publish',
    );
    assert.equal(left?.groups['group:build']?.metadata?.prioritySummary, 'Priority path: Depends on Create');
    assert.equal(left?.groups['group:build']?.metadata?.priorityTier, 'primary');
    assert.equal(left?.groups['group:build']?.metadata?.reliesOnSummary, 'Relies on Create');
    assert.equal(left?.groups['group:build']?.metadata?.influencesSummary, 'Influences Operate and Publish');
    assert.equal(left?.groups['group:build']?.metadata?.mattersNextSummary, 'Matters next for operation in Operate');
    assert.deepEqual(left?.groups['group:build']?.nodeIds, Object.freeze([
        'state-machine:fulfillment',
        'workflow:flow:dispatchApproval',
        'workflow:graph:routing',
    ]));
    assert.equal(left?.groups['group:operate']?.label, 'Operate');
    assert.equal(left?.groups['group:operate']?.metadata?.geographyZone, 'south-east');
    assert.deepEqual(
        left?.groups['group:operate']?.metadata?.relationshipTypes,
        Object.freeze({ build: 'depends-on', publish: 'operates' }),
    );
    assert.equal(left?.groups['group:operate']?.metadata?.relationshipSummary, 'Depends on Build · Operates Publish');
    assert.equal(left?.groups['group:operate']?.metadata?.prioritySummary, 'Priority path: Depends on Build');
    assert.equal(left?.groups['group:operate']?.metadata?.priorityTier, 'primary');
    assert.equal(left?.groups['group:operate']?.metadata?.reliesOnSummary, 'Relies on Build');
    assert.equal(left?.groups['group:operate']?.metadata?.influencesSummary, 'Influences Publish');
    assert.equal(left?.groups['group:operate']?.metadata?.mattersNextSummary, 'Matters next for operation in Publish');
    assert.deepEqual(left?.groups['group:operate']?.nodeIds, Object.freeze(['system:model']));
    assert.equal(left?.groups['group:publish']?.label, 'Publish');
    assert.equal(left?.groups['group:publish']?.metadata?.geographyZone, 'south');
    assert.deepEqual(
        left?.groups['group:publish']?.metadata?.relationshipTypes,
        Object.freeze({
            build: 'depends-on',
            create: 'depends-on',
            operate: 'depends-on',
        }),
    );
    assert.equal(
        left?.groups['group:publish']?.metadata?.relationshipSummary,
        'Depends on Build · Depends on Create · Depends on Operate',
    );
    assert.equal(left?.groups['group:publish']?.metadata?.reliesOnSummary, 'Relies on Build, Create, and Operate');
    assert.equal(left?.groups['group:publish']?.metadata?.influencesSummary, 'Influences downstream work through dependencies');
    assert.equal(left?.groups['group:publish']?.metadata?.mattersNextSummary, 'Matters next for dependency in Build');
    assert.deepEqual(left?.groups['group:publish']?.nodeIds, Object.freeze(['workflow:publish']));
    assert.deepEqual(left?.nodes['document:primary']?.metadata?.relatedPerspectiveIds, Object.freeze(['build', 'publish']));
    assert.equal(left?.nodes['document:primary']?.metadata?.geographyZone, 'north-west');
    assert.equal(left?.nodes['document:primary']?.metadata?.geographySummary, 'Northwest project region');
    assert.deepEqual(
        left?.nodes['document:primary']?.metadata?.relationshipTypes,
        Object.freeze({ build: 'documents', publish: 'documents' }),
    );
    assert.equal(left?.nodes['document:primary']?.metadata?.relationshipSummary, 'Documents DispatchApproval · Documents Publish Targets');
    assert.equal(left?.nodes['document:primary']?.metadata?.reliesOnSummary, 'Relies on DispatchApproval and Publish Targets');
    assert.equal(left?.nodes['document:primary']?.metadata?.influencesSummary, 'Influences downstream work through dependencies');
    assert.equal(left?.nodes['document:primary']?.metadata?.mattersNextSummary, 'Matters next for documentation in DispatchApproval');
    assert.deepEqual(left?.nodes['document:primary']?.refs, Object.freeze(['project:hub', 'workflow:flow:dispatchApproval', 'workflow:publish']));
    assert.deepEqual(left?.nodes['workflow:flow:dispatchApproval']?.metadata?.relatedPerspectiveIds, Object.freeze(['create', 'operate', 'publish']));
    assert.deepEqual(
        left?.nodes['workflow:flow:dispatchApproval']?.metadata?.relationshipTypes,
        Object.freeze({ create: 'operates', operate: 'operates', publish: 'operates' }),
    );
    assert.deepEqual(
        left?.nodes['workflow:flow:dispatchApproval']?.refs,
        Object.freeze(['document:primary', 'project:hub', 'system:model', 'workflow:publish']),
    );
    assert.equal(left?.nodes['workflow:flow:dispatchApproval']?.metadata?.reliesOnSummary, 'Relies on project hub context');
    assert.equal(
        left?.nodes['workflow:flow:dispatchApproval']?.metadata?.influencesSummary,
        'Influences Logistics Control, Publish Targets, and System Model',
    );
    assert.equal(left?.nodes['workflow:flow:dispatchApproval']?.metadata?.mattersNextSummary, 'Matters next for operation in Logistics Control');
    assert.deepEqual(left, right);
});
