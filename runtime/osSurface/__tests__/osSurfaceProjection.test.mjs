import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEnvironmentSurfaceModel } from '@/runtime/osSurface/buildEnvironmentSurfaceModel.js';
import { buildSynthesizedToolSurfaceModel } from '@/runtime/osSurface/buildSynthesizedToolSurfaceModel.js';

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

test('os surface environment model is deterministic and source-order stable', () => {
    const a = buildEnvironmentSurfaceModel({
        runtime: {
            activeEnvironmentId: 'env-main',
            activeSessionId: 'session-7',
            executionTopology: { b: 2, a: 1 },
        },
        workspace: {
            workspaceId: 'design',
            modeId: 'graphic',
            capabilityOverlays: ['conversion', 'ai', 'conversion'],
        },
        federation: {
            participantIds: ['peer-z', 'peer-a', 'peer-z'],
            sessionPhase: 'preview',
            lineageHash: 'lineage-a',
            attestationHash: 'attest-a',
        },
        trust: {
            releaseTrustHash: 'trust-a',
            federationLineageLedgerHead: 'ledger-head-a',
        },
    });

    const b = buildEnvironmentSurfaceModel({
        runtime: {
            activeEnvironmentId: 'env-main',
            activeSessionId: 'session-7',
            executionTopology: { a: 1, b: 2 },
        },
        workspace: {
            workspaceId: 'design',
            modeId: 'graphic',
            capabilityOverlays: ['ai', 'conversion'],
        },
        federation: {
            participantIds: ['peer-a', 'peer-z'],
            sessionPhase: 'preview',
            lineageHash: 'lineage-a',
            attestationHash: 'attest-a',
        },
        trust: {
            releaseTrustHash: 'trust-a',
            federationLineageLedgerHead: 'ledger-head-a',
        },
    });

    assert.deepEqual(a, b);
});

test('os surface synthesized tool model is deterministic and mutation-free', () => {
    const input = {
        activeToolId: 'select',
        tools: [
            {
                toolId: 'create-frame',
                semanticId: 'node.create.frame',
                winnerSource: 'synth:a',
                winnerPriority: 10,
                ownerSources: ['synth:b', 'synth:a'],
                capabilityTags: ['nodes:create', 'nodes:create'],
                defaultActive: false,
                executionSignature: 'create-node@1.0.0',
                migrationWindowId: 'create-node-v1',
            },
            {
                toolId: 'select',
                semanticId: 'selection.primary',
                winnerSource: 'core',
                winnerPriority: 1,
                ownerSources: ['core'],
                capabilityTags: ['selection'],
                defaultActive: true,
                executionSignature: 'select@1.0.0',
                migrationWindowId: null,
            },
        ],
    };
    const before = deepClone(input);
    const first = buildSynthesizedToolSurfaceModel(input);
    const second = buildSynthesizedToolSurfaceModel(input);

    assert.deepEqual(input, before);
    assert.deepEqual(first, second);
    assert.deepEqual(first.tools.map((entry) => entry.toolId), ['create-frame', 'select']);
});
