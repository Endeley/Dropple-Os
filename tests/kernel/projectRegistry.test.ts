import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createProjectRegistry,
    ProjectRegistryEventTypes,
} from '@/runtime/projects/projectRegistry.js';

test('project registry creation is deterministic for equivalent input', () => {
    const fixedNow = () => 1700000000000;
    const left = createProjectRegistry({ now: fixedNow });
    const right = createProjectRegistry({ now: fixedNow });

    const leftProject = left.createProject({
        projectId: 'project.alpha',
        name: 'Alpha Project',
        blueprintId: 'bp.startup.v1',
        owner: 'owner.alpha',
        metadata: { region: 'eu', tier: 'pro' },
        perspectives: { create: true, build: true, publish: true },
    });
    const rightProject = right.createProject({
        projectId: 'project.alpha',
        name: 'Alpha Project',
        blueprintId: 'bp.startup.v1',
        owner: 'owner.alpha',
        metadata: { tier: 'pro', region: 'eu' },
        perspectives: { publish: true, create: true, build: true },
    });

    assert.deepEqual(leftProject, rightProject);
    assert.deepEqual(left.getEvents(), right.getEvents());
});

test('project registry list ordering is deterministic by createdAt then projectId', () => {
    let tick = 0;
    const registry = createProjectRegistry({ now: () => 1700000000000 + ++tick });
    registry.createProject({ projectId: 'project.zeta', name: 'Zeta' });
    registry.createProject({ projectId: 'project.alpha', name: 'Alpha' });
    registry.createProject({ projectId: 'project.mid', name: 'Mid' });

    const ordered = registry.listProjects();
    assert.deepEqual(
        ordered.map((project) => project.projectId),
        ['project.zeta', 'project.alpha', 'project.mid'],
    );
});

test('project archive is deterministic and preserves identity', () => {
    const registry = createProjectRegistry({ now: () => 1700000001234 });
    registry.createProject({
        projectId: 'project.archive',
        name: 'Archive Me',
        createdAt: 1700000000100,
    });
    const archived = registry.archiveProject('project.archive', { archivedAt: 1700000000999 });

    assert.equal(archived.projectId, 'project.archive');
    assert.equal(archived.archivedAt, 1700000000999);
    assert.equal(archived.updatedAt, 1700000000999);
    assert.equal(registry.listProjects({ includeArchived: false }).length, 0);
});

test('project registry rejects duplicate create and unknown archive', () => {
    const registry = createProjectRegistry({ now: () => 1700000000000 });
    registry.createProject({ projectId: 'project.unique', name: 'Unique' });

    assert.throws(
        () => registry.createProject({ projectId: 'project.unique', name: 'Duplicate' }),
        /project already exists/,
    );
    assert.throws(
        () => registry.archiveProject('project.unknown'),
        /cannot archive unknown project/,
    );
});

test('project registry emits canonical create/archive event types', () => {
    const registry = createProjectRegistry({ now: () => 1700000000000 });
    registry.createProject({ projectId: 'project.events', name: 'Events' });
    registry.archiveProject('project.events');

    assert.deepEqual(
        registry.getEvents().map((event) => event.type),
        [ProjectRegistryEventTypes.PROJECT_CREATE, ProjectRegistryEventTypes.PROJECT_ARCHIVE],
    );
});
