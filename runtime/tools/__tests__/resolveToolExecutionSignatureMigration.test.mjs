import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getExecutionSignatureMigrationWindow,
    allowsExecutionSignatureMajorMigration,
} from '@/runtime/tools/resolveToolExecutionSignatureMigration.js';

test('getExecutionSignatureMigrationWindow resolves explicit tool-id migration windows', () => {
    assert.deepEqual(getExecutionSignatureMigrationWindow('exec-version-major-migrated-shared'), {
        fromMajor: 1,
        toMajor: 2,
    });
});

test('getExecutionSignatureMigrationWindow trims tool ids and rejects unknown ids', () => {
    assert.deepEqual(getExecutionSignatureMigrationWindow('  exec-version-major-migrated-shared  '), {
        fromMajor: 1,
        toMajor: 2,
    });
    assert.equal(getExecutionSignatureMigrationWindow('unknown-shared-tool'), null);
    assert.equal(getExecutionSignatureMigrationWindow(''), null);
});

test('allowsExecutionSignatureMajorMigration accepts only explicit major-window upgrades with one core signature', () => {
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [2, 1],
            coreKeyCount: 1,
        }),
        true,
    );
});

test('allowsExecutionSignatureMajorMigration rejects unknown tools, non-window versions, and ambiguous core signatures', () => {
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'unknown-shared-tool',
            majorVersions: [1, 2],
            coreKeyCount: 1,
        }),
        false,
    );
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 3],
            coreKeyCount: 1,
        }),
        false,
    );
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 2],
            coreKeyCount: 2,
        }),
        false,
    );
});
