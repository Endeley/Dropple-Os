import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createEnvironmentArtifact,
    createSnapshotArtifact,
} from '../exportArtifact.js';
import { getExportCapabilities } from '../getExportCapabilities.js';

test('getExportCapabilities derives reproducible environment capabilities from kind only', () => {
    const artifact = createEnvironmentArtifact({
        descriptor: {
            environmentId: 'env-1',
            lineage: {
                lineageRootId: 'root-1',
                versionId: 'version-1',
            },
        },
        resolvedEnvironment: {
            descriptor: {
                environmentId: 'env-1',
                lineage: {
                    lineageRootId: 'root-1',
                    versionId: 'version-1',
                },
            },
            template: {},
            resolvedEnvironment: {
                modeContext: {
                    workspaceId: 'design',
                    modeId: 'graphic',
                },
            },
        },
    });

    const capabilities = getExportCapabilities(artifact);

    assert.equal(capabilities.mode, 'rebuild');
    assert.equal(capabilities.reproducible, true);
    assert.equal(capabilities.supportsLineage, true);
    assert.equal(capabilities.supportsReplay, true);
    assert.deepEqual(capabilities.formats, ['json', 'svg', 'png']);
    assert.equal(Object.isFrozen(capabilities), true);
    assert.equal(Object.isFrozen(capabilities.formats), true);
});

test('getExportCapabilities derives final snapshot capabilities from kind only', () => {
    const artifact = createSnapshotArtifact({
        snapshot: {
            version: 1,
            events: [],
            cursorIndex: -1,
            metadata: {},
        },
    });

    const capabilities = getExportCapabilities(artifact);

    assert.equal(capabilities.mode, 'final');
    assert.equal(capabilities.reproducible, false);
    assert.equal(capabilities.supportsLineage, false);
    assert.equal(capabilities.supportsReplay, false);
    assert.deepEqual(capabilities.formats, ['json', 'svg', 'png']);
});

test('getExportCapabilities rejects missing artifact kind', () => {
    assert.throws(
        () => getExportCapabilities(null),
        /Invalid artifact: missing kind/,
    );
});
