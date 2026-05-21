import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkspaceShellSurfaceModel } from '@/runtime/osSurface/buildWorkspaceShellSurfaceModel.js';

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

test('workspace shell surface model is deterministic and source-order stable', () => {
    const a = buildWorkspaceShellSurfaceModel({
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            activeEnvironmentId: 'env-a',
            activeSessionId: 'session-a',
            capabilityOverlays: ['conversion', 'ai', 'conversion'],
            federation: {
                participantIds: ['peer-z', 'peer-a', 'peer-z'],
                sessionPhase: 'preview',
            },
            trustEnvelope: {
                releaseTrustHash: 'trust-a',
            },
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'move' }, { toolId: 'select' }, { toolId: 'move' }],
        },
    });

    const b = buildWorkspaceShellSurfaceModel({
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            activeEnvironmentId: 'env-a',
            activeSessionId: 'session-a',
            capabilityOverlays: ['ai', 'conversion'],
            federation: {
                participantIds: ['peer-a', 'peer-z'],
                sessionPhase: 'preview',
            },
            trustEnvelope: {
                releaseTrustHash: 'trust-a',
            },
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'select' }, { toolId: 'move' }],
        },
    });

    assert.deepEqual(a, b);
});

test('workspace shell surface model is mutation-free for the input snapshot', () => {
    const input = {
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            federation: {
                participantIds: ['peer-b', 'peer-a'],
            },
            capabilityOverlays: ['ai', 'conversion'],
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'select' }],
        },
    };
    const before = deepClone(input);
    buildWorkspaceShellSurfaceModel(input);
    assert.deepEqual(input, before);
});

test('workspace shell surface model exposes canonical projection shape and ordering', () => {
    const model = buildWorkspaceShellSurfaceModel({
        environment: {
            workspaceId: 'design',
            modeId: 'graphic',
            activeEnvironmentId: 'env-a',
            activeSessionId: 'session-a',
            capabilityOverlays: ['conversion', 'ai', 'conversion'],
            federation: {
                participantIds: ['peer-z', 'peer-a', 'peer-z'],
                sessionPhase: 'preview',
            },
            trustEnvelope: {
                releaseTrustHash: 'trust-a',
            },
        },
        synthesizedTools: {
            activeToolId: 'select',
            tools: [{ toolId: 'move' }, { toolId: 'select' }, { toolId: 'move' }],
        },
    });

    assert.deepEqual(Object.keys(model), [
        'workspaceId',
        'modeId',
        'environmentId',
        'sessionId',
        'overlays',
        'participantIds',
        'federationPhase',
        'releaseTrustHash',
        'activeToolId',
        'visibleToolIds',
    ]);
    assert.deepEqual(model.overlays, ['ai', 'conversion']);
    assert.deepEqual(model.participantIds, ['peer-a', 'peer-z']);
    assert.deepEqual(model.visibleToolIds, ['move', 'select']);
    assert.equal(model.workspaceId, 'design');
    assert.equal(model.modeId, 'graphic');
    assert.equal(model.federationPhase, 'preview');
});
