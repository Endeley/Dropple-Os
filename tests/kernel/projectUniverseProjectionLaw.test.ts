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
    assert.deepEqual(left, right);
});
