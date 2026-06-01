import test from 'node:test';
import assert from 'node:assert/strict';

import { EventTypes } from '@/core/events/eventTypes.js';
import { resolveProjectIdentityFromProjection } from '@/ui/bridges/projectIdentityReadBridge.js';

test('project identity read bridge is deterministic for equivalent projection input', () => {
    const input = Object.freeze({
        document: Object.freeze({
            meta: Object.freeze({
                projectBootstrap: Object.freeze({
                    projectId: 'project.identity',
                    projectName: 'Identity Project',
                    blueprintId: 'bp.identity.v1',
                    owner: 'owner.identity',
                }),
            }),
        }),
        events: Object.freeze([
            Object.freeze({
                type: EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP,
                timestamp: 1700000000100,
            }),
            Object.freeze({
                type: EventTypes.NODE_CREATE,
                timestamp: 1700000000200,
            }),
        ]),
    });

    const left = resolveProjectIdentityFromProjection(input);
    const right = resolveProjectIdentityFromProjection(input);

    assert.deepEqual(left, right);
    assert.equal(left.projectId, 'project.identity');
    assert.equal(left.name, 'Identity Project');
    assert.equal(left.blueprintId, 'bp.identity.v1');
    assert.equal(left.owner, 'owner.identity');
    assert.equal(left.createdAt, 1700000000100);
    assert.equal(left.updatedAt, 1700000000200);
});

test('project identity read bridge fails closed when bootstrap metadata is absent', () => {
    const result = resolveProjectIdentityFromProjection({
        document: {},
        events: [],
    });

    assert.equal(result.projectId, null);
    assert.equal(result.name, 'Untitled Project');
    assert.equal(result.blueprintId, null);
    assert.equal(result.owner, null);
    assert.equal(result.createdAt, null);
    assert.equal(result.updatedAt, null);
});
