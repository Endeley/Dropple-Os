import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

import { publishTemplateFromWorkspace } from './publishTemplateFromWorkspace.js';
import { workspaceToCCMTemplate } from './workspaceToCCMTemplate.js';
import { loadCertifiedTemplates } from '@/engine/templates/templateLoader.js';
import { installCertifiedTemplate } from '@/domain/templates/installCertifiedTemplate.js';
import { buildRuntimeSnapshotFromCertifiedTemplate } from '@/domain/templates/installCertifiedTemplate.js';
import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { createTimelineController } from '@/engine/timeline/timelineController.js';
import { buildEvaluationFingerprint } from '@/engine/replay/buildEvaluationFingerprint.js';
import { computeCapabilityIndex } from '@/engine/observability/capabilityIndex.js';
import { buildSceneTree } from '@/domain/scene/buildSceneTree.js';

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map(stableSerialize);
    }
    if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        const result = {};
        for (const key of keys) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }
    return value;
}

function hashObject(value) {
    return crypto.createHash('sha256').update(JSON.stringify(stableSerialize(value))).digest('hex');
}

function createDocument() {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
                root: {
                    id: 'root',
                    type: 'frame',
                    children: ['headline', 'cta'],
                },
                headline: {
                    id: 'headline',
                    type: 'text',
                    children: [],
                },
                cta: {
                    id: 'cta',
                    type: 'button',
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
                        { id: 'kf-400', t: 400, v: 1, easing: 'ease-in-out' },
                    ],
                },
                'clip-headline-translateY': {
                    id: 'clip-headline-translateY',
                    target: 'headline',
                    property: 'translateY',
                    keyframes: [
                        { id: 'kf-y-0', t: 0, v: 16 },
                        { id: 'kf-y-400', t: 400, v: 0, easing: 'ease-in-out' },
                    ],
                },
            },
        },
    };
}

function withTempRegistry(label, fn) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${label}-`));
    const originalCwd = process.cwd();
    process.chdir(tempDir);

    try {
        return fn(tempDir);
    } finally {
        process.chdir(originalCwd);
    }
}

function runtimeStateToStructuralGraph(runtimeState) {
    const documentSceneGraph = runtimeState?.document?.sceneGraph ?? {};
    const nodesById = documentSceneGraph?.nodes ?? {};

    return {
        rootId: documentSceneGraph?.rootIds?.[0] ?? null,
        nodes: Object.values(nodesById).map((node) => ({
            id: node.id,
            type: node.type,
            transform: node.transform ?? { x: 0, y: 0, scale: 1 },
            opacity: node.opacity ?? 1,
            channels: node.channels ?? {},
        })),
        tree: Object.fromEntries(
            Object.entries(nodesById).map(([nodeId, node]) => [nodeId, [...(node.children ?? [])]]),
        ),
    };
}

function createInstalledController(runtimeState) {
    const timeline = runtimeState?.timeline?.timelines?.default ?? null;
    const timelineController = createTimelineController(timeline);

    return {
        ...timelineController,
        sceneGraph: buildSceneTree(runtimeStateToStructuralGraph(runtimeState)),
    };
}

test('uiux template roundtrip preserves structure and motion across publish -> registry -> install -> re-export', () => {
    withTempRegistry('dropple-template-roundtrip', () => {
        const document = createDocument();

        const published = publishTemplateFromWorkspace({
            document,
            metadata: {
                title: 'Roundtrip Hero',
                description: 'Phase 2 roundtrip fixture',
            },
            workspaceMode: 'design',
        });

        assert.deepEqual(
            published.seed.states.default.channels.map((channel) => ({
                id: channel.id,
                property: channel.property,
                target: channel.target,
            })),
            [
                { id: 'opacity', property: 'opacity', target: 'headline' },
                { id: 'transform.y', property: 'translateY', target: 'headline' },
            ],
        );

        const loaded = loadCertifiedTemplates({ mode: 'design' });
        assert.equal(loaded.length, 1);
        assert.equal(loaded[0].snapshotHash, published.seed.snapshotHash);

        const dispatcher = createEventDispatcher({ headless: true });
        const installResult = installCertifiedTemplate({
            dispatcher,
            template: loaded[0],
        });
        assert.equal(installResult.installed, true);

        const runtimeState = dispatcher.getState();
        assert.deepEqual(
            Object.keys(runtimeState.document.motion?.clips ?? {}).sort(),
            ['clip:headline:opacity', 'clip:headline:translateY'],
        );
        assert.equal(
            runtimeState.document.motion.clips['clip:headline:opacity'].keyframes[1].easing,
            'easeInOut',
        );
        assert.equal(
            runtimeState.document.motion.clips['clip:headline:translateY'].keyframes[0].v,
            16,
        );
        assert.deepEqual(
            runtimeState.timeline?.timelines?.default?.channels?.map((channel) => ({
                id: channel.id,
                property: channel.property,
                target: channel.target,
            })),
            [
                { id: 'opacity', property: 'opacity', target: 'headline' },
                { id: 'transform.y', property: 'translateY', target: 'headline' },
            ],
        );

        const roundtripped = workspaceToCCMTemplate({
            document: runtimeState.document,
            metadata: published.artifact.metadata,
            workspaceMode: 'design',
        });

        assert.deepEqual(roundtripped, published.artifact);
    });
});

test('uiux template roundtrip preserves certification fingerprint and capability hash after install hydration', () => {
    withTempRegistry('dropple-template-replay', () => {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Replay Stable Hero',
            },
            workspaceMode: 'design',
        });

        const snapshot = buildRuntimeSnapshotFromCertifiedTemplate(published.seed);
        const installedController = createInstalledController(snapshot);

        const fingerprint = buildEvaluationFingerprint(installedController, 500);
        const capabilityHash = hashObject(computeCapabilityIndex(installedController));

        assert.equal(fingerprint, published.seed.certification.fingerprint);
        assert.equal(capabilityHash, published.seed.certification.capabilityHash);
    });
});
