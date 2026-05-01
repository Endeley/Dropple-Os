import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';
import { publishTemplateFork } from '@/templates/publishTemplateFork.js';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';
import {
    activateTemplateEnvironment,
    buildRuntimeSnapshotFromTemplateEnvironment,
} from '@/runtime/templates/activateTemplateEnvironment.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import { loadRegistry } from '@/domain/templates/TemplateRegistry.js';

function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function createDocument(opacityTarget = 1) {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: ['headline'],
                },
                headline: {
                    id: 'headline',
                    type: 'text',
                    children: [],
                },
            },
        },
        motion: {
            clips: {
                'clip-headline-opacity': {
                    id: 'clip-headline-opacity',
                    target: 'headline',
                    property: 'opacity',
                    keyframes: [
                        { id: 'kf-0', t: 0, v: 0 },
                        { id: 'kf-500', t: 500, v: opacityTarget, easing: 'ease-in' },
                    ],
                },
            },
        },
    };
}

function createDerivedSnapshot(parentSeed, version, mutateLastOpacity) {
    const states = clone(parentSeed.states);
    const defaultState = parentSeed.defaultState;
    states[defaultState].channels = states[defaultState].channels.map((channel) => (
        channel.id === 'opacity'
            ? {
                ...channel,
                keyframes: channel.keyframes.map((keyframe, index, list) => (
                    index === list.length - 1
                        ? { ...keyframe, value: mutateLastOpacity }
                        : keyframe
                )),
            }
            : channel
    ));

    return {
        id: parentSeed.id,
        version,
        baseSceneGraph: clone(parentSeed.baseSceneGraph),
        states,
        defaultState,
        params: clone(parentSeed.params),
        metadata: clone(parentSeed.metadata),
    };
}

function withTempRegistry(run) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-activate-template-environment-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
        return run();
    } finally {
        process.chdir(originalCwd);
    }
}

function createDescriptor(rootSeed, versionId) {
    return createDerivedEnvironmentDescriptor({
        lineage: {
            lineageRootId: rootSeed.lineage.rootId,
            versionId,
        },
        environment: {
            overrides: {
                props: {
                    headline: 'Activated',
                },
            },
            runtimeConfig: {
                mode: 'graphic',
                playback: {
                    time: 240,
                    paused: true,
                },
                viewport: {
                    zoom: 1.25,
                    offset: { x: 12, y: 34 },
                },
            },
            modeContext: {
                workspaceId: 'design',
                modeId: 'graphic',
                overlayId: 'brand-systems',
            },
        },
        metadata: {
            label: 'Activation Preview',
        },
    });
}

test('activateTemplateEnvironment deterministically hydrates the same runtime state for the same descriptor', () =>
    withTempRegistry(() => {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Activation Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const fork = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.1.0', 0.7),
            engineVersion: root.seed.certification.engineVersion,
        });
        const descriptor = createDescriptor(root.seed, fork.seed.lineage.nodeId);

        const dispatcherA = createEventDispatcher({ headless: true });
        const dispatcherB = createEventDispatcher({ headless: true });

        const activatedA = activateTemplateEnvironment({
            descriptor,
            dispatcher: dispatcherA,
        });
        const activatedB = activateTemplateEnvironment({
            descriptor,
            dispatcher: dispatcherB,
        });

        assert.equal(
            hashRuntimeState(activatedA.runtimeSnapshot),
            hashRuntimeState(activatedB.runtimeSnapshot),
        );
        assert.equal(activatedA.environmentId, activatedB.environmentId);
        assert.equal(activatedA.hydratedState.workspace.id, 'design');
        assert.equal(activatedA.hydratedState.workspace.modeId, 'graphic');
        assert.equal(activatedA.hydratedState.workspace.overlayId, 'brand-systems');
        assert.deepEqual(activatedA.hydratedState.workspace.viewport, {
            x: 12,
            y: 34,
            scale: 1.25,
        });
        assert.equal(activatedA.hydratedState.playback.time, 240);
        assert.equal(activatedA.hydratedState.playback.timeMs, 240);
        assert.equal(activatedA.hydratedState.playback.frame, 240);
        assert.equal(activatedA.hydratedState.playback.isPlaying, false);
    }));

test('activateTemplateEnvironment translates only into dispatcher hydration and does not mutate registry truth', () =>
    withTempRegistry(() => {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Activation Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const descriptor = createDescriptor(root.seed, root.seed.lineage.nodeId);
        const registryBefore = JSON.stringify(loadRegistry());

        const calls = [];
        const dispatcher = {
            hydrateRuntimeState(nextState, options) {
                calls.push({ nextState, options });
                return nextState;
            },
            dispatch() {
                throw new Error('activateTemplateEnvironment must not call dispatcher.dispatch()');
            },
        };

        const activated = activateTemplateEnvironment({
            descriptor,
            dispatcher,
        });
        const registryAfter = JSON.stringify(loadRegistry());

        assert.equal(calls.length, 1);
        assert.equal(calls[0].options.animate, false);
        assert.equal(activated.activated, true);
        assert.equal(registryBefore, registryAfter);
    }));

test('buildRuntimeSnapshotFromTemplateEnvironment reuses pure resolution output without runtime-side lineage lookup', () =>
    withTempRegistry(() => {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Activation Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const descriptor = createDescriptor(root.seed, root.seed.lineage.nodeId);
        const resolved = resolveTemplateEnvironment(descriptor);
        const runtimeSnapshot = buildRuntimeSnapshotFromTemplateEnvironment({
            template: resolved.template,
            resolvedEnvironment: resolved.resolvedEnvironment,
        });

        assert.equal(runtimeSnapshot.workspace.id, 'design');
        assert.equal(runtimeSnapshot.workspace.modeId, 'graphic');
        assert.equal(runtimeSnapshot.workspace.overlayId, 'brand-systems');
        assert.equal(runtimeSnapshot.playback.time, 240);
        assert.ok(runtimeSnapshot.document);
    }));
