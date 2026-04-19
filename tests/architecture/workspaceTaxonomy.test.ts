import test from 'node:test';
import assert from 'node:assert/strict';

import {
    CANONICAL_WORKSPACES,
    CANONICAL_MODES,
    listCanonicalWorkspaceIds,
    listCanonicalModeIds,
    listCanonicalModesForWorkspace,
    resolveWorkspaceDefaultMode,
} from '@/platform/workspaces/canonicalRegistry.js';

test('exactly 5 canonical workspaces exist', () => {
    const ids = listCanonicalWorkspaceIds();

    assert.deepEqual(ids, ['build', 'collaborate', 'design', 'media', 'system']);
});

test('each workspace declares a valid default mode', () => {
    for (const workspaceId of Object.keys(CANONICAL_WORKSPACES)) {
        const defaultMode = resolveWorkspaceDefaultMode(workspaceId);

        assert.ok(defaultMode);
        assert.ok(CANONICAL_MODES[defaultMode]);
        assert.equal(CANONICAL_MODES[defaultMode].workspaceId, workspaceId);
    }
});

test('every mode belongs to exactly one canonical workspace', () => {
    for (const modeId of Object.keys(CANONICAL_MODES)) {
        const mode = CANONICAL_MODES[modeId];

        assert.ok(mode.workspaceId);
        assert.ok(CANONICAL_WORKSPACES[mode.workspaceId]);
    }
});

test('workspace mode listings only include modes owned by that workspace', () => {
    for (const workspaceId of listCanonicalWorkspaceIds()) {
        const modes = listCanonicalModesForWorkspace(workspaceId);

        assert.ok(modes.length > 0);

        for (const mode of modes) {
            assert.equal(mode.workspaceId, workspaceId);
        }

        const defaultMode = resolveWorkspaceDefaultMode(workspaceId);
        assert.ok(modes.some((mode) => mode.id === defaultMode));
    }
});

test('no duplicate mode ownership entries exist', () => {
    const seen = new Set();

    for (const modeId of listCanonicalModeIds()) {
        assert.equal(seen.has(modeId), false);
        seen.add(modeId);
    }
});

test('no extra top-level workspace-like entries exist', () => {
    const allowed = new Set(['design', 'media', 'build', 'system', 'collaborate']);

    for (const workspaceId of Object.keys(CANONICAL_WORKSPACES)) {
        assert.equal(allowed.has(workspaceId), true);
    }
});
