import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createEventDispatcher } from '@/runtime/dispatcher/dispatch.js';
import { hashRuntimeState } from '@/core/persistence/hashDocument.js';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';
import {
    buildInitialEnvironmentDescriptorFromQuery,
    resolveSeededWorkspace,
} from '../workspaceEnvironmentBoot.js';
import {
    buildRuntimeSnapshotFromArtifact,
    createEnvironmentArtifact,
} from '@/runtime/export/exportArtifact.js';
import { activateTemplateEnvironment } from '@/runtime/templates/activateTemplateEnvironment.js';

function withTempRegistry(run) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-workspace-environment-boot-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
        return run();
    } finally {
        process.chdir(originalCwd);
    }
}

function createDocument() {
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
                        { id: 'kf-500', t: 500, v: 0.7, easing: 'ease-in' },
                    ],
                },
            },
        },
    };
}

test('workspace/new boot, editor artifact reconstruction, and runtime activation preserve canonical environment identity', () =>
    withTempRegistry(() => {
        const publication = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Workspace Boot Parity',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });

        const descriptor = buildInitialEnvironmentDescriptorFromQuery({
            lineageRootId: publication.seed.lineage.rootId,
            versionId: publication.seed.lineage.nodeId,
            workspaceId: 'design',
            modeId: 'graphic',
            overlayId: 'brand-systems',
        });

        const seeded = resolveSeededWorkspace({
            initialEnvironmentDescriptor: descriptor,
        });

        assert.equal(
            seeded.initialEnvironmentDescriptor.environmentId,
            seeded.initialResolvedTemplateEnvironment.environmentId,
        );

        const artifact = createEnvironmentArtifact({
            descriptor: seeded.initialEnvironmentDescriptor,
            resolvedEnvironment: seeded.initialResolvedTemplateEnvironment,
        });
        const reconstructed = buildRuntimeSnapshotFromArtifact(artifact);

        const dispatcher = createEventDispatcher({ headless: true });
        const activated = activateTemplateEnvironment({
            descriptor: seeded.initialEnvironmentDescriptor,
            dispatcher,
        });

        assert.equal(
            reconstructed.document?.meta?.id,
            seeded.initialEnvironmentDescriptor.environmentId,
        );
        assert.equal(
            activated.runtimeSnapshot.document?.meta?.id,
            seeded.initialEnvironmentDescriptor.environmentId,
        );
        assert.equal(reconstructed.workspace?.workspaceId, 'design');
        assert.equal(reconstructed.workspace?.modeId, 'graphic');
        assert.equal(reconstructed.workspace?.overlayId, 'brand-systems');
        assert.equal(activated.runtimeSnapshot.workspace?.workspaceId, 'design');
        assert.equal(activated.runtimeSnapshot.workspace?.modeId, 'graphic');
        assert.equal(activated.runtimeSnapshot.workspace?.overlayId, 'brand-systems');
        assert.equal(
            hashRuntimeState(reconstructed),
            hashRuntimeState(activated.runtimeSnapshot),
        );
    }));
