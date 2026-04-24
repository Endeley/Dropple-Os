import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { assertReducerOwnership } from '@/core/events/reducerOwnership.js';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = new Set(['.git', '.next', 'node_modules', 'out', 'build']);
const TOKEN_DOCUMENT_PATTERNS = [
    /document\.tokens\b/,
    /document\.themes\b/,
    /document\.tokenReviews\b/,
    /document\.tokenVersions\b/,
];

const TOKEN_DOCUMENT_ALLOWLIST = new Set([
    'core/events/reducers/index.js',
    'core/events/reducers/themeReducers.js',
    'core/events/reducers/tokenReducers.js',
    'core/events/reducers/tokenVersionReducers.js',
    'core/events/reducers/tokenReviewReducers.js',
    'core/persistence/documentEnvelope.js',
    'runtime/projection/zustandBridge.js',
    'runtime/tokens/projectActiveTokens.js',
    'runtime/tokens/projectTokenVersionDiff.js',
    'runtime/workspaces/defaultDocumentSlices.js',
    'runtime/workspaces/workspaceContracts.js',
    'runtime/__tests__/tokenVersionDiff.test.mjs',
    'runtime/__tests__/tokenMergePreview.test.mjs',
    'runtime/__tests__/tokenConflictResolution.test.mjs',
    'runtime/__tests__/tokenReviewWorkflow.test.mjs',
]);

function shouldIgnore(relPath) {
    const normalized = relPath.replaceAll('\\', '/');
    const [rootDir] = normalized.split('/');
    if (rootDir?.startsWith('.next')) return true;
    for (const dir of IGNORE_DIRS) {
        if (normalized === dir || normalized.startsWith(`${dir}/`)) return true;
    }
    return false;
}

function walk(dir, relBase = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
        if (shouldIgnore(relPath)) continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath, relPath));
            continue;
        }

        if (!entry.isFile()) continue;
        if (!ALLOWED_EXT.has(path.extname(entry.name))) continue;
        files.push({ fullPath, relPath });
    }

    return files;
}

test('token document slices remain reducer-owned', () => {
    const violations = [];
    const files = walk(ROOT);

    for (const file of files) {
        const normalized = file.relPath.replaceAll('\\', '/');
        if (normalized.startsWith('tests/')) continue;
        if (TOKEN_DOCUMENT_ALLOWLIST.has(normalized)) continue;

        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            if (TOKEN_DOCUMENT_PATTERNS.some((pattern) => pattern.test(line))) {
                violations.push(`${normalized}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});

test('ui modules do not write runtime token truth directly', () => {
    const violations = [];
    const uiRoot = path.join(ROOT, 'ui');
    const files = walk(uiRoot, 'ui');

    for (const file of files) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        if (!/useRuntimeStore\.setState\s*\(/.test(content)) continue;
        if (!/\btokens\s*:/.test(content)) continue;
        violations.push(file.relPath);
    }

    assert.deepEqual(violations, []);
});

test('reducer ownership rejects foreign token mutation and accepts token-owned slices', () => {
    const previous = {
        document: {
            layout: {},
            tokens: {},
            themes: { activeThemeId: null, byId: {}, order: [] },
            tokenVersions: { entries: {}, order: [], activeVersionId: null },
        },
    };

    const foreign = {
        ...previous,
        document: {
            ...previous.document,
            tokens: { color: { primary: '#ff0000' } },
        },
    };

    assert.throws(
        () =>
            assertReducerOwnership('layoutReducers', previous, foreign, {
                allowedDocumentSlices: ['layout'],
                allowedRuntimeSlices: [],
            }),
        /foreign document slices: tokens/,
    );

    const owned = {
        ...previous,
        document: {
            ...previous.document,
            tokens: { color: { primary: '#ff0000' } },
            themes: {
                activeThemeId: 'dark',
                byId: { dark: { id: 'dark', tokens: {} } },
                order: ['dark'],
            },
        },
    };

    assert.doesNotThrow(() =>
        assertReducerOwnership('tokenReducers', previous, owned, {
            allowedDocumentSlices: ['tokens', 'themes'],
            allowedRuntimeSlices: [],
        }),
    );
});
