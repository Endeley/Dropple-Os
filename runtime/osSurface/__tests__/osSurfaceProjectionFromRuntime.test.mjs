import test from 'node:test';
import assert from 'node:assert/strict';
import { replayEvents } from '@/runtime/dispatcher/replayEvents.js';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { syncRuntimeToZustand } from '@/runtime/projection/zustandBridge.js';
import {
    buildEnvironmentSurfaceModelFromProjection,
    buildSynthesizedToolSurfaceModelFromProjection,
} from '@/runtime/osSurface/fromProjectionSurface.js';

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createRuntimeSnapshot({
    registeredTools = {},
    descriptorBySource = {},
    sourcePriority = {},
} = {}) {
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
            presence: {
                zed: { userId: 'zed' },
                amy: { userId: 'amy' },
            },
        },
        federationAudit: {
            entries: [{ id: 'fed-1' }],
            hash: 'fed-hash-a',
            maxEntries: 256,
        },
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
            registeredTools,
            registeredToolDescriptors: descriptorBySource,
            sourcePriority,
        },
    };
}

test('os surface adapters are replay-equivalent from live projected runtime snapshots', () => {
    const leftRuntime = replayEvents({
        initialState: createRuntimeSnapshot({
            registeredTools: {
                'src-z': ['create-frame', 'select'],
                'src-a': ['select'],
            },
            descriptorBySource: {
                'src-z': {
                    'create-frame': {
                        id: 'create-frame',
                        semanticId: 'node.create.frame',
                        capabilityTags: ['nodes:create'],
                        executionSignature: 'create-node@1.0.0',
                    },
                },
                'src-a': {
                    select: {
                        id: 'select',
                        semanticId: 'selection.primary',
                        capabilityTags: ['selection'],
                        defaultActive: true,
                        executionSignature: 'select@1.0.0',
                    },
                },
            },
            sourcePriority: { 'src-z': 10, 'src-a': 1 },
        }),
        events: [],
    });

    const rightRuntime = replayEvents({
        initialState: createRuntimeSnapshot({
            registeredTools: {
                'src-a': ['select'],
                'src-z': ['select', 'create-frame'],
            },
            descriptorBySource: {
                'src-a': {
                    select: {
                        id: 'select',
                        semanticId: 'selection.primary',
                        capabilityTags: ['selection'],
                        defaultActive: true,
                        executionSignature: 'select@1.0.0',
                    },
                },
                'src-z': {
                    'create-frame': {
                        id: 'create-frame',
                        semanticId: 'node.create.frame',
                        capabilityTags: ['nodes:create'],
                        executionSignature: 'create-node@1.0.0',
                    },
                },
            },
            sourcePriority: { 'src-a': 1, 'src-z': 10 },
        }),
        events: [],
    });

    syncRuntimeToZustand(leftRuntime);
    const envLeft = buildEnvironmentSurfaceModelFromProjection();
    const toolsLeft = buildSynthesizedToolSurfaceModelFromProjection();

    syncRuntimeToZustand(rightRuntime);
    const envRight = buildEnvironmentSurfaceModelFromProjection();
    const toolsRight = buildSynthesizedToolSurfaceModelFromProjection();

    assert.deepEqual(envLeft, envRight);
    assert.deepEqual(toolsLeft, toolsRight);
});

test('os surface adapters do not mutate runtime truth', () => {
    const runtime = replayEvents({
        initialState: createRuntimeSnapshot(),
        events: [],
    });
    const before = clone(runtime);

    syncRuntimeToZustand(runtime);
    buildEnvironmentSurfaceModelFromProjection();
    buildSynthesizedToolSurfaceModelFromProjection();

    assert.deepEqual(runtime, before);
});
