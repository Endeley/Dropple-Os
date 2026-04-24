import test from 'node:test';
import assert from 'node:assert/strict';
import { bootWorkspaceDocument } from '@/runtime/workspaces/index.js';

test('bootWorkspaceDocument injects required slices for media animation mode', () => {
    const input = {
        meta: { id: 'doc-1' },
    };

    const next = bootWorkspaceDocument({
        document: input,
        workspace: 'media',
        mode: 'animation',
    });

    assert.notEqual(next, input);
    assert.deepEqual(next.graphs, {});
    assert.deepEqual(next.motion, { clips: {} });
    assert.deepEqual(next.sequences, { sequences: {}, activeSequenceId: null });
    assert.deepEqual(next.rigs, { rigs: {}, activeRigId: null });
    assert.deepEqual(next.stateMachines, { machines: {}, activeMachineId: null });
    assert.equal(input.graphs, undefined);
});

test('bootWorkspaceDocument preserves existing slices without overwriting them', () => {
    const motion = { clips: { existing: { id: 'existing' } } };
    const graphs = [{ id: 'graph-1' }];
    const input = {
        graphs,
        motion,
    };

    const next = bootWorkspaceDocument({
        document: input,
        workspace: 'media',
        mode: 'video',
    });

    assert.equal(next.motion, motion);
    assert.equal(next.graphs, graphs);
    assert.deepEqual(next.sequences, { sequences: {}, activeSequenceId: null });
});

test('bootWorkspaceDocument returns the original document when nothing is missing', () => {
    const input = {
        graphs: {},
        motion: { clips: {} },
        sequences: { sequences: {}, activeSequenceId: null },
    };

    const next = bootWorkspaceDocument({
        document: input,
        workspace: 'media',
        mode: 'video',
    });

    assert.equal(next, input);
});

test('bootWorkspaceDocument leaves unknown workspaces unchanged', () => {
    const input = { meta: { id: 'doc-2' } };

    const next = bootWorkspaceDocument({
        document: input,
        workspace: 'unknown',
        mode: 'mystery',
    });

    assert.equal(next, input);
});

test('bootWorkspaceDocument injects token governance slices for system workspace', () => {
    const input = {
        meta: { id: 'doc-system' },
    };

    const next = bootWorkspaceDocument({
        document: input,
        workspace: 'system',
        mode: 'tokens',
    });

    assert.notEqual(next, input);
    assert.deepEqual(next.tokens, {});
    assert.deepEqual(next.themes, {
        activeThemeId: null,
        byId: {},
        order: [],
    });
    assert.deepEqual(next.tokenReviews, {
        entries: {},
        order: [],
        activeReviewId: null,
    });
    assert.deepEqual(next.tokenVersions, {
        entries: {},
        order: [],
        activeVersionId: null,
    });
});
