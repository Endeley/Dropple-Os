import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { publishTemplateFromWorkspace } from '../../../templates/publishTemplateFromWorkspace.js';
import { publishTemplateFork } from '../../../templates/publishTemplateFork.js';
import { publishTemplateMerge } from '../../../templates/publishTemplateMerge.js';
import {
    getLineageRoot,
    resolveTemplateByLineageKey,
} from '../TemplateRegistry.js';

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

test('template lineage reconstruction key resolves a certified version deterministically from lineageRootId + versionId', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-env-key-'));
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
        const forkA = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.1.0', 0.5),
            engineVersion: root.seed.certification.engineVersion,
        });
        const forkB = publishTemplateFork({
            parentVersionId: root.seed.lineage.nodeId,
            snapshot: createDerivedSnapshot(root.seed, '1.2.0', 0.75),
            engineVersion: root.seed.certification.engineVersion,
        });
        const merge = publishTemplateMerge({
            parentVersionIds: [forkB.seed.lineage.nodeId, forkA.seed.lineage.nodeId],
            snapshot: createDerivedSnapshot(root.seed, '1.3.0', 0.95),
            engineVersion: root.seed.certification.engineVersion,
        });

        const lineageRoot = getLineageRoot(root.seed.lineage.rootId);
        const resolved = resolveTemplateByLineageKey({
            lineageRootId: root.seed.lineage.rootId,
            versionId: merge.seed.lineage.nodeId,
        });

        assert.ok(lineageRoot);
        assert.deepEqual(lineageRoot.versionIds, [
            root.seed.lineage.nodeId,
            forkA.seed.lineage.nodeId,
            forkB.seed.lineage.nodeId,
            merge.seed.lineage.nodeId,
        ]);
        assert.ok(resolved);
        assert.equal(resolved.version, '1.3.0');
        assert.equal(resolved.lineageRootId, root.seed.lineage.rootId);
        assert.deepEqual(
            resolved.parentVersionIds,
            [forkA.seed.lineage.nodeId, forkB.seed.lineage.nodeId].sort(),
        );
        assert.equal(
            resolveTemplateByLineageKey({
                lineageRootId: root.seed.lineage.rootId,
                versionId: merge.seed.lineage.nodeId,
            })?.versionId,
            merge.seed.lineage.nodeId,
        );
        assert.equal(
            resolveTemplateByLineageKey({
                lineageRootId: 'missing-root',
                versionId: merge.seed.lineage.nodeId,
            }),
            null,
        );
        assert.equal(
            resolveTemplateByLineageKey({
                lineageRootId: root.seed.lineage.rootId,
                versionId: 'missing-version',
            }),
            null,
        );
    } finally {
        process.chdir(originalCwd);
    }
});
