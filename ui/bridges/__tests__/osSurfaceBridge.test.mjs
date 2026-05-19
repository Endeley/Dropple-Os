import test from 'node:test';
import assert from 'node:assert/strict';
import { INTENTS } from '@/core/intents/intentTypes.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { syncRuntimeToZustand } from '@/runtime/projection/zustandBridge.js';
import {
    readOsSurfaceSnapshot,
    readOsWorkspaceShellSurfaceModel,
} from '@/ui/bridges/osSurfaceReadBridge.js';
import { dispatchOsSurfaceIntent } from '@/ui/bridges/osSurfaceIntentBridge.js';

function createProjectionRuntime() {
    return {
        document: {
            sceneGraph: {
                rootIds: ['root'],
                nodes: {
                    root: { id: 'root', type: 'frame', x: 0, y: 0, width: 100, height: 60, children: [] },
                },
            },
        },
        workspace: {
            id: 'workspace',
            mode: 'graphic',
            viewport: { x: 0, y: 0, zoom: 1 },
            canvasSurface: { kind: 'design' },
            profile: { environmentId: 'env-a' },
            policy: { mode: { overlays: ['ai', 'conversion'] } },
        },
        collaboration: {
            session: { id: 'session-a', phase: 'preview' },
            presence: { amy: { userId: 'amy' }, zed: { userId: 'zed' } },
        },
        federationAudit: { entries: [{ id: 'fed-1' }], hash: 'fed-hash-a', maxEntries: 256 },
        scene: {
            temporalContext: {
                sequenceId: 'seq-a',
                frame: 12,
                timeMs: 500,
                activeClips: [],
                activeAudioClips: [],
                activeVideoClips: [],
            },
        },
        tools: {
            activeTool: 'select',
            registeredTools: {},
            registeredToolDescriptors: {},
            sourcePriority: {},
        },
    };
}

test('os surface read + intent route roundtrip is deterministic', () => {
    syncRuntimeToZustand(createProjectionRuntime());

    const eventsA = [];
    const first = readOsSurfaceSnapshot();
    const routeA = dispatchOsSurfaceIntent(
        { type: INTENTS.TOOL_SET_ACTIVE, payload: { toolId: 'select' } },
        { dispatch: (event) => eventsA.push(event) },
    );

    const eventsB = [];
    const second = readOsSurfaceSnapshot();
    const routeB = dispatchOsSurfaceIntent(
        { type: INTENTS.TOOL_SET_ACTIVE, payload: { toolId: 'select' } },
        { dispatch: (event) => eventsB.push(event) },
    );

    assert.deepEqual(first, second);
    assert.deepEqual(routeA, routeB);
    assert.deepEqual(eventsA, eventsB);
});

test('os workspace shell surface model read is deterministic', () => {
    syncRuntimeToZustand(createProjectionRuntime());
    const left = readOsWorkspaceShellSurfaceModel();
    const right = readOsWorkspaceShellSurfaceModel();

    assert.deepEqual(left, right);
    assert.equal(left.workspaceId, 'workspace');
    assert.equal(left.modeId, 'graphic');
    assert.equal(left.sessionId, 'session-a');
    assert.deepEqual(left.participantIds, ['amy', 'zed']);
});

test('os surface bridge roundtrip is coordination-only and does not mutate projected truth', () => {
    syncRuntimeToZustand(createProjectionRuntime());
    const before = structuredClone(useRuntimeStore.getState());

    const snapshot = readOsSurfaceSnapshot();
    const routed = dispatchOsSurfaceIntent(
        { type: INTENTS.WORKSPACE_ACTIVATE, payload: { workspaceId: 'design' } },
        { dispatch: () => {} },
    );
    const after = useRuntimeStore.getState();

    assert.ok(snapshot.environment);
    assert.ok(snapshot.synthesizedTools);
    assert.equal(routed.ok, true);
    assert.deepEqual(after, before);
});
