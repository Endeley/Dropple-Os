import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSnapshotArtifact,
    exportArtifact,
} from '../exportArtifact.js';

test('exportArtifact rejects formats not declared by artifact capabilities', async () => {
    const artifact = createSnapshotArtifact({
        snapshot: {
            version: 1,
            events: [],
            cursorIndex: -1,
            metadata: {},
        },
    });

    await assert.rejects(
        () =>
            exportArtifact({
                artifact,
                format: 'animation',
            }),
        /Export format not allowed for artifact: animation/,
    );
});
