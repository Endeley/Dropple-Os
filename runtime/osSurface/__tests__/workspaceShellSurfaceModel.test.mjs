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
