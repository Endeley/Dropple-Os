import test from 'node:test';
import assert from 'node:assert/strict';

import { createBlueprintInstallManifest } from '@/runtime/blueprints/createBlueprintInstallManifest.js';

function createBlueprintFixture() {
    return Object.freeze({
        id: 'bp.manifest.v1',
        name: 'Manifest Blueprint',
        lineage: Object.freeze({
            rootId: 'bp.manifest.root',
            versionId: 'bp.manifest.v1',
            parentVersionId: null,
        }),
    });
}

test('blueprint install manifest builder is deterministic and canonical', () => {
    const blueprint = createBlueprintFixture();
    const left = createBlueprintInstallManifest({
        projectId: 'project.manifest',
        projectName: 'Manifest Project',
        defaultPerspectiveId: 'create',
        blueprint,
    });
    const right = createBlueprintInstallManifest({
        projectId: 'project.manifest',
        projectName: 'Manifest Project',
        defaultPerspectiveId: 'create',
        blueprint,
    });

    assert.deepEqual(left, right);
    assert.equal(left.schemaVersion, 1);
    assert.equal(left.blueprintId, blueprint.id);
    assert.equal(left.blueprintVersionId, blueprint.lineage.versionId);
});

test('blueprint install manifest builder fails closed on invalid inputs', () => {
    assert.throws(
        () =>
            createBlueprintInstallManifest({
                projectId: 'project.manifest',
                projectName: 'Invalid',
                defaultPerspectiveId: 'create',
                blueprint: {
                    ...createBlueprintFixture(),
                    id: '',
                    lineage: {
                        ...createBlueprintFixture().lineage,
                        versionId: '',
                    },
                },
            }),
        /manifest missing required field: blueprintId/,
    );
});
