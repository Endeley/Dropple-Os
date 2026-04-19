import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { CANONICAL_MODES, CANONICAL_WORKSPACES } from '@/platform/workspaces/canonicalRegistry.js';
import { MODE_REGISTRY } from '@/platform/workspaces/modeRegistry.js';
import { WORKSPACE_ALIASES } from '@/platform/workspaces/modeResolution.js';
import {
    getWorkspaceActivation,
    getWorkspaceAdapter,
    getWorkspaceContractDefinition,
    resolveModeId,
    resolveWorkspaceId,
} from '@/ui/bridges/workspaceActivationFacade.js';

const ROOT = process.cwd();

function readSource(relativePath) {
    return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function hasFunctionValue(value, seen = new Set()) {
    if (typeof value === 'function') return true;
    if (!value || typeof value !== 'object') return false;
    if (seen.has(value)) return false;

    seen.add(value);

    if (value instanceof Set) {
        for (const entry of value) {
            if (hasFunctionValue(entry, seen)) {
                return true;
            }
        }
        return false;
    }

    for (const entry of Object.values(value)) {
        if (hasFunctionValue(entry, seen)) {
            return true;
        }
    }

    return false;
}

test('platform systems are never classified as workspaces, modes, or aliases', () => {
    const forbiddenIds = [
        'dispatcher',
        'dispatch',
        'reducer',
        'reducers',
        'replay',
        'runtime',
        'scene-runtime',
        'plugin',
        'plugins',
        'tool-registration-runtime',
    ];

    for (const id of forbiddenIds) {
        assert.equal(Boolean(CANONICAL_WORKSPACES[id]), false, `workspace taxonomy leaked platform system "${id}"`);
        assert.equal(Boolean(CANONICAL_MODES[id]), false, `mode taxonomy leaked platform system "${id}"`);
        assert.equal(Boolean(MODE_REGISTRY[id]), false, `mode policy leaked platform system "${id}"`);
        assert.equal(Boolean(WORKSPACE_ALIASES[id]), false, `workspace alias leaked platform system "${id}"`);
    }
});

test('canonical registry remains pure workspace taxonomy', () => {
    for (const workspace of Object.values(CANONICAL_WORKSPACES)) {
        assert.deepEqual(Object.keys(workspace).sort(), ['defaultMode', 'id', 'label']);
    }

    for (const mode of Object.values(CANONICAL_MODES)) {
        assert.deepEqual(Object.keys(mode).sort(), ['id', 'label', 'workspaceId']);
    }
});

test('mode registry remains pure mode exposure policy', () => {
    const expectedModeKeys = ['definitionId', 'exposure', 'id', 'label', 'workspaceId'];
    const expectedExposureKeys = ['canvas', 'export', 'inspector', 'panels', 'readOnly', 'review', 'timeline', 'tools'];

    for (const mode of Object.values(MODE_REGISTRY)) {
        assert.deepEqual(Object.keys(mode).sort(), expectedModeKeys);
        assert.deepEqual(Object.keys(mode.exposure).sort(), expectedExposureKeys);
    }
});

test('mode resolution does not mention platform execution primitives', () => {
    const source = readSource('platform/workspaces/modeResolution.js');
    const forbiddenTokens = [
        'dispatch(',
        'dispatcher',
        'reducer',
        'reducers',
        'replay',
        'hydrateRuntimeState',
        'setState(',
        'getState(',
    ];

    for (const token of forbiddenTokens) {
        assert.equal(source.includes(token), false, `modeResolution must not contain platform execution token "${token}"`);
    }
});

test('workspace activation facade does not own taxonomy tables or execution primitives', () => {
    const source = readSource('ui/bridges/workspaceActivationFacade.js');
    const forbiddenTokens = [
        'CANONICAL_WORKSPACES',
        'CANONICAL_MODES',
        'MODE_REGISTRY',
        'WORKSPACE_ALIASES',
        'dispatcher',
        'dispatch',
        'emit(',
        'registerTools',
        'unregisterTools',
        'reducer',
        'reducers',
        'replay',
        'hydrateRuntimeState',
        'runtime',
    ];

    for (const token of forbiddenTokens) {
        assert.equal(source.includes(token), false, `workspaceActivationFacade must not own "${token}"`);
    }
});

test('workspace activation facade is deterministic and returns canonical identity', () => {
    const inputs = [
        { workspaceId: 'design', modeId: 'uiux' },
        { workspaceId: 'media' },
        { modeId: 'review' },
    ];

    for (const input of inputs) {
        const activationA = getWorkspaceActivation(input);
        const activationB = getWorkspaceActivation(input);
        const adapterA = getWorkspaceAdapter(input);
        const adapterB = getWorkspaceAdapter(input);
        const contractA = getWorkspaceContractDefinition(input);
        const contractB = getWorkspaceContractDefinition(input);
        const workspaceId = resolveWorkspaceId(input);
        const modeId = resolveModeId(input);

        assert.deepEqual(activationA, activationB);
        assert.deepEqual(adapterA, adapterB);
        assert.deepEqual(contractA, contractB);

        assert.equal(activationA?.workspaceId, workspaceId);
        assert.equal(activationA?.workspace, workspaceId);
        assert.equal(activationA?.modeId, modeId);
        assert.equal(adapterA?.workspaceId, workspaceId);
        assert.equal(adapterA?.modeId, modeId);
        assert.equal(contractA?.id, workspaceId);
    }
});

test('workspace activation facade outputs plain data, not executable policy', () => {
    const outputs = [
        getWorkspaceActivation({ workspaceId: 'design', modeId: 'uiux' }),
        getWorkspaceAdapter({ workspaceId: 'design', modeId: 'uiux' }),
        getWorkspaceContractDefinition({ workspaceId: 'design', modeId: 'uiux' }),
    ];

    for (const output of outputs) {
        assert.equal(hasFunctionValue(output), false, 'workspace activation output must stay data-only');
    }
});
