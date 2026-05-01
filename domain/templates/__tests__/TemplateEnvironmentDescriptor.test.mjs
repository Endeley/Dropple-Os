import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    createDerivedEnvironmentDescriptor,
    deriveDerivedEnvironmentId,
} from '../DerivedEnvironmentDescriptor.js';
import { resolveTemplateEnvironment } from '../resolveTemplateEnvironment.js';
import { loadRegistry } from '../TemplateRegistry.js';
import { publishTemplateFromWorkspace } from '../../../templates/publishTemplateFromWorkspace.js';
import { publishTemplateFork } from '../../../templates/publishTemplateFork.js';

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

test('derived environment descriptor derives a stable environment id from lineage and pure environment shaping', () => {
    const descriptorA = createDerivedEnvironmentDescriptor({
        lineage: {
            lineageRootId: 'root-1',
            versionId: 'version-1',
        },
        environment: {
            overrides: {
                tokens: {
                    accent: '#00f',
                    neutral: '#111',
                },
                props: {
                    title: 'Primary',
                },
            },
            runtimeConfig: {
                mode: 'graphic',
                viewport: {
                    zoom: 1.5,
                    offset: { x: 24, y: 48 },
                },
                playback: {
                    time: 1200,
                    paused: true,
                },
            },
            modeContext: {
                workspaceId: 'design',
                modeId: 'graphic',
                overlayId: 'brand-systems',
            },
        },
        metadata: {
            label: 'Primary Brand Preview',
        },
    });

    const descriptorB = createDerivedEnvironmentDescriptor({
        lineage: {
            versionId: 'version-1',
            lineageRootId: 'root-1',
        },
        environment: {
            modeContext: {
                overlayId: 'brand-systems',
                modeId: 'graphic',
                workspaceId: 'design',
            },
            runtimeConfig: {
                playback: {
                    paused: true,
                    time: 1200,
                },
                viewport: {
                    offset: { y: 48, x: 24 },
                    zoom: 1.5,
                },
                mode: 'graphic',
            },
            overrides: {
                props: {
                    title: 'Primary',
                },
                tokens: {
                    neutral: '#111',
                    accent: '#00f',
                },
            },
        },
        metadata: {
            label: 'Primary Brand Preview',
        },
    });

    assert.equal(
        descriptorA.environmentId,
        deriveDerivedEnvironmentId({
            lineage: {
                lineageRootId: 'root-1',
                versionId: 'version-1',
            },
            environment: {
                overrides: {
                    props: {
                        title: 'Primary',
                    },
                    tokens: {
                        neutral: '#111',
                        accent: '#00f',
                    },
                },
                runtimeConfig: {
                    mode: 'graphic',
                    playback: {
                        paused: true,
                        time: 1200,
                    },
                    viewport: {
                        zoom: 1.5,
                        offset: { x: 24, y: 48 },
                    },
                },
                modeContext: {
                    workspaceId: 'design',
                    modeId: 'graphic',
                    overlayId: 'brand-systems',
                },
            },
        }),
    );
    assert.equal(descriptorA.environmentId, descriptorB.environmentId);
    assert.equal(Object.isFrozen(descriptorA), true);
    assert.equal(Object.isFrozen(descriptorA.lineage), true);
    assert.equal(Object.isFrozen(descriptorA.environment), true);
    assert.equal(Object.isFrozen(descriptorA.environment.overrides), true);
    assert.equal(Object.isFrozen(descriptorA.environment.runtimeConfig), true);
    assert.equal(Object.isFrozen(descriptorA.environment.modeContext), true);
    assert.equal(Object.isFrozen(descriptorA.metadata), true);
});

test('derived environment descriptor requires explicit canonical mode context', () => {
    assert.throws(
        () =>
            createDerivedEnvironmentDescriptor({
                lineage: {
                    lineageRootId: 'root-1',
                    versionId: 'version-1',
                },
                environment: {
                    overrides: {},
                    runtimeConfig: {},
                    modeContext: {
                        workspaceId: 'design',
                    },
                },
            }),
        /modeId must be a non-empty string/i,
    );
});

test('resolveTemplateEnvironment deterministically resolves the same certified template for the same descriptor', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-environment-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Environment Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const fork = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.1.0', 0.7),
            engineVersion: root.seed.certification.engineVersion,
        });

        const descriptor = createDerivedEnvironmentDescriptor({
            lineage: {
                lineageRootId: root.seed.lineage.rootId,
                versionId: fork.seed.lineage.nodeId,
            },
            environment: {
                overrides: {
                    props: {
                        headline: 'Fork Preview',
                    },
                },
                runtimeConfig: {
                    mode: 'graphic',
                    viewport: {
                        zoom: 1.2,
                        offset: { x: 10, y: 20 },
                    },
                },
                modeContext: {
                    workspaceId: 'design',
                    modeId: 'graphic',
                    overlayId: 'brand-systems',
                },
            },
            metadata: {
                label: 'Fork Preview',
            },
        });

        const resolvedA = resolveTemplateEnvironment(descriptor);
        const resolvedB = resolveTemplateEnvironment({
            lineage: {
                lineageRootId: root.seed.lineage.rootId,
                versionId: fork.seed.lineage.nodeId,
            },
            environment: {
                overrides: {
                    props: {
                        headline: 'Fork Preview',
                    },
                },
                runtimeConfig: {
                    mode: 'graphic',
                    viewport: {
                        offset: { y: 20, x: 10 },
                        zoom: 1.2,
                    },
                },
                modeContext: {
                    overlayId: 'brand-systems',
                    modeId: 'graphic',
                    workspaceId: 'design',
                },
            },
            metadata: {
                label: 'Fork Preview',
            },
        });

        assert.equal(resolvedA.environmentId, descriptor.environmentId);
        assert.equal(resolvedA.environmentId, resolvedB.environmentId);
        assert.equal(resolvedA.template.versionId, fork.seed.lineage.nodeId);
        assert.equal(resolvedA.template.lineageRootId, root.seed.lineage.rootId);
        assert.deepEqual(resolvedA.lineage, {
            lineageRootId: root.seed.lineage.rootId,
            versionId: fork.seed.lineage.nodeId,
        });
        assert.equal(resolvedA.resolvedEnvironment.modeContext.modeId, 'graphic');
        assert.equal(resolvedA.resolvedEnvironment.modeContext.overlayId, 'brand-systems');
        assert.deepEqual(resolvedA.template, resolvedB.template);
        assert.equal(Object.isFrozen(resolvedA), true);
        assert.equal(Object.isFrozen(resolvedA.descriptor), true);
    } finally {
        process.chdir(originalCwd);
    }
});

test('resolveTemplateEnvironment rejects unknown lineage keys and does not mutate registry truth', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-environment-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        const root = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Environment Root',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        const registryBefore = JSON.stringify(loadRegistry());
        const resolved = resolveTemplateEnvironment({
            lineage: {
                lineageRootId: root.seed.lineage.rootId,
                versionId: root.seed.lineage.nodeId,
            },
            environment: {
                overrides: {
                    inputs: {
                        viewport: 'tablet',
                    },
                },
                runtimeConfig: {
                    mode: 'uiux',
                },
                modeContext: {
                    workspaceId: 'design',
                    modeId: 'uiux',
                },
            },
        });
        const registryAfter = JSON.stringify(loadRegistry());

        assert.equal(registryBefore, registryAfter);
        assert.equal(resolved.template.versionId, root.seed.lineage.nodeId);
        assert.throws(
            () =>
                resolveTemplateEnvironment({
                    lineage: {
                        lineageRootId: root.seed.lineage.rootId,
                        versionId: 'missing-version',
                    },
                    environment: {
                        modeContext: {
                            workspaceId: 'design',
                            modeId: 'uiux',
                        },
                    },
                }),
            /unknown lineage key/i,
        );
    } finally {
        process.chdir(originalCwd);
    }
});
