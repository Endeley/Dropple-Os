import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const SCANNER_FILES = [
    'scripts/architectureGuard.mjs',
    'scripts/architectureTransitionAudit.mjs',
    'scripts/architectureDrift.mjs',
    'tests/architecture/truthBoundaryImports.test.ts',
    'tests/architecture/dispatcherOwnership.test.ts',
    'tests/architecture/tokenAuthority.test.ts',
    'tests/architecture/templateAuthority.test.ts',
    'tests/architecture/systemWorkspaceTokenOwnership.test.ts',
];

test('architecture scanners/tests reuse centralized ignore policy', () => {
    const violations = [];

    for (const relPath of SCANNER_FILES) {
        const fullPath = path.join(ROOT, relPath);
        const source = fs.readFileSync(fullPath, 'utf8');
        const normalized = source.replaceAll('\r\n', '\n');

        if (!normalized.includes('architectureIgnorePolicy.mjs')) {
            violations.push(`${relPath}: missing import from scripts/architectureIgnorePolicy.mjs`);
        }

        if (/\bconst\s+IGNORE_DIRS\s*=\s*new\s+Set\s*\(/.test(normalized)) {
            violations.push(`${relPath}: declares local IGNORE_DIRS instead of centralized policy`);
        }

        if (/\bconst\s+IGNORE_FILES\s*=\s*new\s+Set\s*\(/.test(normalized)) {
            violations.push(`${relPath}: declares local IGNORE_FILES instead of centralized policy`);
        }
    }

    assert.deepEqual(violations, []);
});

test('scanner-specific ignore expansions are declared via shared policy accessors', () => {
    const requiredSharedAccessor = [
        'tests/architecture/dispatcherOwnership.test.ts',
        'tests/architecture/templateAuthority.test.ts',
        'scripts/architectureDrift.mjs',
    ];
    const violations = [];

    for (const relPath of requiredSharedAccessor) {
        const source = fs.readFileSync(path.join(ROOT, relPath), 'utf8').replaceAll('\r\n', '\n');
        if (!source.includes('getArchitectureScannerPolicy')) {
            violations.push(`${relPath}: must use getArchitectureScannerPolicy for scoped ignore expansion`);
        }
    }

    assert.deepEqual(violations, []);
});
