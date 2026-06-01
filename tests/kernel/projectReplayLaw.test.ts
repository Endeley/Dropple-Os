import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createProjectRegistry,
    replayProjectRegistryEvents,
} from '@/runtime/projects/projectRegistry.js';

test('project create replay is deterministic and equivalent', () => {
    const registry = createProjectRegistry({ now: () => 1700000000000 });
    registry.createProject({
        projectId: 'project.replay.create',
        name: 'Replay Create',
        blueprintId: 'bp.startup.v1',
        perspectives: { create: true },
    });

    const events = registry.getEvents();
    const replayA = replayProjectRegistryEvents(events);
    const replayB = replayProjectRegistryEvents(events);

    assert.deepEqual(replayA, replayB);
    assert.deepEqual(replayA, registry.getState());
});

test('project archive replay is deterministic and equivalent', () => {
    const registry = createProjectRegistry({ now: () => 1700000000000 });
    registry.createProject({
        projectId: 'project.replay.archive',
        name: 'Replay Archive',
        createdAt: 1700000000010,
    });
    registry.archiveProject('project.replay.archive', { archivedAt: 1700000000050 });

    const events = registry.getEvents();
    const replayA = replayProjectRegistryEvents(events);
    const replayB = replayProjectRegistryEvents(events);

    assert.deepEqual(replayA, replayB);
    assert.deepEqual(replayA, registry.getState());
});
