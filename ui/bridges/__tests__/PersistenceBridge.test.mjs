import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
    assertExclusiveInitialBootSources,
    resolveInitialEnvironmentBoot,
} from '../persistenceBootSources.js';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';
import { createDerivedEnvironmentDescriptor } from '@/domain/templates/DerivedEnvironmentDescriptor.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';

function withTempRegistry(run) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-persistence-bridge-'));
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    try {
        return run();
    } finally {
        process.chdir(originalCwd);
    }
}

function createSeedDocument() {
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
    };
}

function createEnvironmentDescriptor(rootSeed) {
    return createDerivedEnvironmentDescriptor({
        lineage: {
            lineageRootId: rootSeed.lineage.rootId,
            versionId: rootSeed.lineage.nodeId,
        },
        environment: {
            overrides: {},
            runtimeConfig: {
                mode: 'graphic',
            },
            modeContext: {
                workspaceId: 'design',
                modeId: 'graphic',
                overlayId: 'brand-systems',
            },
        },
        metadata: {
            source: 'persistence-bridge-test',
        },
    });
}

test('PersistenceBridge allows descriptor-first boot when no snapshot sources are present', () => {
    const result = assertExclusiveInitialBootSources({
        initialEnvironmentDescriptor: {
            environmentId: 'env-1',
        },
        initialRuntimeSnapshot: null,
        initialEvents: [],
        initialCursorIndex: -1,
    });

    assert.equal(result.hasInitialEnvironmentDescriptor, true);
    assert.equal(result.hasInitialRuntimeSnapshot, null);
    assert.equal(result.hasInitialEvents, false);
    assert.equal(result.hasExplicitCursor, false);
});

test('PersistenceBridge rejects mixed descriptor and snapshot boot sources', () => {
    assert.throws(
        () =>
            assertExclusiveInitialBootSources({
                initialEnvironmentDescriptor: { environmentId: 'env-1' },
                initialRuntimeSnapshot: { document: {} },
                initialEvents: [],
                initialCursorIndex: -1,
            }),
        /cannot boot from both descriptor and snapshot sources/,
    );

    assert.throws(
        () =>
            assertExclusiveInitialBootSources({
                initialEnvironmentDescriptor: { environmentId: 'env-1' },
                initialRuntimeSnapshot: null,
                initialEvents: [{ type: 'noop' }],
                initialCursorIndex: -1,
            }),
        /cannot boot from both descriptor and snapshot sources/,
    );
});

test('PersistenceBridge requires a pre-resolved environment for descriptor-based client boot', () =>
    withTempRegistry(() => {
        const publication = publishTemplateFromWorkspace({
            document: createSeedDocument(),
            metadata: {
                title: 'Persistence Bridge Seed',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const descriptor = createEnvironmentDescriptor(publication.seed);
        const resolved = resolveTemplateEnvironment(descriptor);

        assert.throws(
            () =>
                resolveInitialEnvironmentBoot({
                    initialEnvironmentDescriptor: descriptor,
                }),
            /requires an initialResolvedTemplateEnvironment/,
        );

        assert.equal(
            resolveInitialEnvironmentBoot({
                initialEnvironmentDescriptor: descriptor,
                initialResolvedTemplateEnvironment: resolved,
            }).environmentId,
            resolved.environmentId,
        );
        assert.equal(
            resolved.resolvedEnvironment.modeContext.workspaceId,
            'design',
        );
        assert.equal(
            resolved.resolvedEnvironment.modeContext.modeId,
            'graphic',
        );
        assert.equal(
            resolved.resolvedEnvironment.modeContext.overlayId,
            'brand-systems',
        );
    }));

test('PersistenceBridge rejects mismatched descriptor and resolved environment identity', () =>
    withTempRegistry(() => {
        const publication = publishTemplateFromWorkspace({
            document: createSeedDocument(),
            metadata: {
                title: 'Persistence Bridge Seed',
                version: '1.0.0',
            },
            workspaceMode: 'design',
        });
        const descriptor = createEnvironmentDescriptor(publication.seed);
        const mismatchedDescriptor = createDerivedEnvironmentDescriptor({
            lineage: descriptor.lineage,
            environment: {
                ...descriptor.environment,
                modeContext: {
                    ...descriptor.environment.modeContext,
                    overlayId: 'learning',
                },
            },
            metadata: {
                ...descriptor.metadata,
                label: 'Mismatched Environment',
            },
        });
        const resolved = resolveTemplateEnvironment(descriptor);

        assert.throws(
            () =>
                resolveInitialEnvironmentBoot({
                    initialEnvironmentDescriptor: mismatchedDescriptor,
                    initialResolvedTemplateEnvironment: resolved,
                }),
            /does not match the initial environment descriptor/,
        );
    }));
