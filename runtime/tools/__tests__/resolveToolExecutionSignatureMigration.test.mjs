import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getExecutionSignatureMigrationWindow,
    allowsExecutionSignatureMajorMigration,
    validateExecutionSignatureMigrationWindows,
} from '@/runtime/tools/resolveToolExecutionSignatureMigration.js';

test('getExecutionSignatureMigrationWindow resolves explicit tool-id migration windows', () => {
    assert.deepEqual(getExecutionSignatureMigrationWindow('exec-version-major-migrated-shared'), {
        fromMajor: 1,
        toMajor: 2,
        sunsetAt: '2026-09-01T00:00:00.000Z',
        ticket: 'ARCH-421',
    });
});

test('getExecutionSignatureMigrationWindow trims tool ids and rejects unknown ids', () => {
    assert.deepEqual(getExecutionSignatureMigrationWindow('  exec-version-major-migrated-shared  '), {
        fromMajor: 1,
        toMajor: 2,
        sunsetAt: '2026-09-01T00:00:00.000Z',
        ticket: 'ARCH-421',
    });
    assert.equal(getExecutionSignatureMigrationWindow('unknown-shared-tool'), null);
    assert.equal(getExecutionSignatureMigrationWindow(''), null);
});

test('allowsExecutionSignatureMajorMigration accepts explicit major-window upgrades before sunset with one core signature', () => {
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [2, 1],
            coreKeyCount: 1,
            currentTimeMs: Date.parse('2026-08-31T23:59:59.999Z'),
        }),
        true,
    );
});

test('allowsExecutionSignatureMajorMigration rejects at and after sunset boundary', () => {
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 2],
            coreKeyCount: 1,
            currentTimeMs: Date.parse('2026-09-01T00:00:00.000Z'),
        }),
        false,
    );
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 2],
            coreKeyCount: 1,
            currentTimeMs: Date.parse('2026-09-02T00:00:00.000Z'),
        }),
        false,
    );
});

test('allowsExecutionSignatureMajorMigration rejects unknown tools, non-window versions, and ambiguous core signatures', () => {
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'unknown-shared-tool',
            majorVersions: [1, 2],
            coreKeyCount: 1,
            currentTimeMs: Date.parse('2026-08-01T00:00:00.000Z'),
        }),
        false,
    );
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 3],
            coreKeyCount: 1,
            currentTimeMs: Date.parse('2026-08-01T00:00:00.000Z'),
        }),
        false,
    );
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 2],
            coreKeyCount: 2,
            currentTimeMs: Date.parse('2026-08-01T00:00:00.000Z'),
        }),
        false,
    );
});

test('allowsExecutionSignatureMajorMigration fails closed for missing or malformed governance time input', () => {
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 2],
            coreKeyCount: 1,
        }),
        false,
    );
    assert.equal(
        allowsExecutionSignatureMajorMigration({
            toolId: 'exec-version-major-migrated-shared',
            majorVersions: [1, 2],
            coreKeyCount: 1,
            currentTimeMs: Number.NaN,
        }),
        false,
    );
});

test('validateExecutionSignatureMigrationWindows enforces constitutional migration metadata', () => {
    assert.deepEqual(
        validateExecutionSignatureMigrationWindows({
            'exec-version-major-migrated-shared': {
                fromMajor: 1,
                toMajor: 2,
                sunsetAt: '2026-09-01T00:00:00.000Z',
                ticket: 'ARCH-421',
            },
        }),
        {
            'exec-version-major-migrated-shared': {
                fromMajor: 1,
                toMajor: 2,
                sunsetAt: '2026-09-01T00:00:00.000Z',
                ticket: 'ARCH-421',
            },
        },
    );

    assert.throws(
        () =>
            validateExecutionSignatureMigrationWindows({
                broken: {
                    fromMajor: 2,
                    toMajor: 1,
                    sunsetAt: '2026-09-01T00:00:00.000Z',
                    ticket: 'ARCH-999',
                },
            }),
        /fromMajor < toMajor/,
    );

    assert.throws(
        () =>
            validateExecutionSignatureMigrationWindows({
                broken: {
                    fromMajor: 1,
                    toMajor: 2,
                    sunsetAt: '',
                    ticket: 'ARCH-999',
                },
            }),
        /valid ISO sunsetAt/,
    );

    assert.throws(
        () =>
            validateExecutionSignatureMigrationWindows({
                broken: {
                    fromMajor: 1,
                    toMajor: 2,
                    sunsetAt: '2026-09-01T00:00:00.000Z',
                    ticket: '',
                },
            }),
        /non-empty ticket/,
    );
});
