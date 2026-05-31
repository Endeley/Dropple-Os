import test from 'node:test';
import assert from 'node:assert/strict';

import { listBlueprintInstallOptions } from '@/ui/bridges/blueprintInstallBridge.js';

test('blueprint install options projection is deterministic and read-only', () => {
    const left = listBlueprintInstallOptions();
    const right = listBlueprintInstallOptions();

    assert.deepEqual(left, right);
    assert.equal(Array.isArray(left), true);
    assert.equal(left.length > 0, true);

    for (const option of left) {
        assert.equal(typeof option.id, 'string');
        assert.equal(typeof option.versionId, 'string');
        assert.equal(typeof option.seedEventCount, 'number');
        assert.equal(typeof option.workspaceProfiles, 'object');
        assert.equal(typeof option.certificationHash, 'string');
    }
});

