import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    getArchitectureIgnoreDirs,
    shouldIgnoreArchitectureEntry,
} from '../../scripts/architectureIgnorePolicy.mjs';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = getArchitectureIgnoreDirs();

const TOKEN_IMPORT = /@\/ui\/tokens\b/;
const IMPORT_STATEMENT = /^\s*import\b.*\bfrom\b/;
const CSS_SET_PROPERTY = /\.style\.setProperty\s*\(/;
const TOKEN_TABLE_PATTERNS = [
    /\bcolor\s*:\s*\{/,
    /\bspace\s*:\s*\{/,
    /\bradius\s*:\s*\{/,
    /\bmotion\s*:\s*\{/,
];

const TOKEN_TABLE_ALLOWLIST = new Set([
    'runtime/tokens/tokenRegistry.js',
    'ui/bridges/tokenCssBridge.js',
]);

function shouldIgnore(relPath, fullPath, entry) {
    return shouldIgnoreArchitectureEntry({ relPath, fullPath, entry, ignoreDirs: IGNORE_DIRS });
}

function walk(dir, relBase = '') {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
        const fullPath = path.join(dir, entry.name);
        if (shouldIgnore(relPath, fullPath, entry)) continue;
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

function countTokenTableSignals(content) {
    return TOKEN_TABLE_PATTERNS.reduce(
        (count, pattern) => count + (pattern.test(content) ? 1 : 0),
        0,
    );
}

function readAllSourceFiles(rootDir = ROOT) {
    return walk(rootDir);
}

function collectLegacyUiTokenImportViolations(rootDir = ROOT) {
    return readAllSourceFiles(rootDir)
        .filter(({ relPath }) => !relPath.startsWith('tests/'))
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => IMPORT_STATEMENT.test(line) && TOKEN_IMPORT.test(line))
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });
}

function collectTokenTableViolations(rootDir = ROOT) {
    return readAllSourceFiles(rootDir)
        .filter(({ relPath }) => !relPath.startsWith('tests/'))
        .filter(({ relPath }) => !TOKEN_TABLE_ALLOWLIST.has(relPath))
        .map(({ fullPath, relPath }) => ({
            relPath,
            signalCount: countTokenTableSignals(fs.readFileSync(fullPath, 'utf8')),
        }))
        .filter(({ signalCount }) => signalCount >= 3)
        .map(({ relPath, signalCount }) => `${relPath}: duplicate token table candidate (${signalCount} token groups)`);
}

function collectCssProjectionViolations(rootDir = ROOT) {
    return readAllSourceFiles(rootDir)
        .filter(({ relPath }) => !relPath.startsWith('tests/'))
        .filter(({ relPath }) => relPath !== 'ui/bridges/tokenCssBridge.js')
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => CSS_SET_PROPERTY.test(line))
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });
}

function createTempFixture() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'token-authority-'));
}

function writeFixtureFile(rootDir, relPath, content) {
    const fullPath = path.join(rootDir, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}

test('token authority law A: no legacy ui token imports remain', () => {
    assert.deepEqual(collectLegacyUiTokenImportViolations(), []);
});

test('token authority law B: token tables are defined only in canonical authority files', () => {
    assert.deepEqual(collectTokenTableViolations(), []);
});

test('token authority law C: CSS token projection is owned by a single bridge', () => {
    assert.deepEqual(collectCssProjectionViolations(), []);
});

test('token authority scanner ignores nested generated and vendor directories by path segment', (t) => {
    const rootDir = createTempFixture();
    t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));

    writeFixtureFile(rootDir, 'runtime/tokens/tokenRegistry.js', `
        export const tokens = {
            color: {},
            space: {},
            radius: {},
            motion: {},
        };
    `);
    writeFixtureFile(rootDir, 'ui/bridges/tokenCssBridge.js', `
        export function project(root, name, value) {
            root.style.setProperty(name, value);
        }
    `);
    writeFixtureFile(rootDir, 'node_modules/pkg/bad.js', `
        export const tokens = { color: {}, space: {}, radius: {}, motion: {} };
        element.style.setProperty('--bad', '1');
    `);
    writeFixtureFile(rootDir, 'foo/node_modules/pkg/worse.js', `
        import thing from '@/ui/tokens';
        export const tokens = { color: {}, space: {}, radius: {}, motion: {} };
    `);
    writeFixtureFile(rootDir, '.next/server/chunks/bad.js', `
        element.style.setProperty('--bad', '1');
    `);
    writeFixtureFile(rootDir, 'foo/.next-e2e/server/chunks/bad.js', `
        export const tokens = { color: {}, space: {}, radius: {}, motion: {} };
    `);
    writeFixtureFile(rootDir, 'foo/.next-prod/static/chunks/bad.js', `
        import thing from '@/ui/tokens';
    `);

    assert.deepEqual(collectLegacyUiTokenImportViolations(rootDir), []);
    assert.deepEqual(collectTokenTableViolations(rootDir), []);
    assert.deepEqual(collectCssProjectionViolations(rootDir), []);
});

test('token authority scanner ignores nested repository boundaries generically', (t) => {
    const rootDir = createTempFixture();
    t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));

    writeFixtureFile(rootDir, 'nested-checkout/.git', 'gitdir: /tmp/other-worktree\n');
    writeFixtureFile(rootDir, 'nested-checkout/ui/rogue.js', `
        element.style.setProperty('--rogue', '1');
        export const tokens = { color: {}, space: {}, radius: {}, motion: {} };
    `);
    writeFixtureFile(rootDir, 'nested-checkout/runtime/tokens/tokenRegistry.js', `
        export const tokens = {
            color: {},
            space: {},
            radius: {},
            motion: {},
        };
    `);

    assert.deepEqual(collectTokenTableViolations(rootDir), []);
    assert.deepEqual(collectCssProjectionViolations(rootDir), []);
});

test('token authority keeps canonical bridge and token registry lawful', (t) => {
    const rootDir = createTempFixture();
    t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));

    writeFixtureFile(rootDir, 'runtime/tokens/tokenRegistry.js', `
        export const tokens = {
            color: {},
            space: {},
            radius: {},
            motion: {},
        };
    `);
    writeFixtureFile(rootDir, 'ui/bridges/tokenCssBridge.js', `
        export function project(root, name, value) {
            root.style.setProperty(name, value);
        }
    `);

    assert.deepEqual(collectTokenTableViolations(rootDir), []);
    assert.deepEqual(collectCssProjectionViolations(rootDir), []);
});

test('token authority still rejects unauthorized first-party style.setProperty bridges', (t) => {
    const rootDir = createTempFixture();
    t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));

    writeFixtureFile(rootDir, 'ui/bridges/tokenCssBridge.js', `
        export function project(root, name, value) {
            root.style.setProperty(name, value);
        }
    `);
    writeFixtureFile(rootDir, 'ui/runtime/rogueCssBridge.js', `
        export function project(root, name, value) {
            root.style.setProperty(name, value);
        }
    `);

    assert.deepEqual(collectCssProjectionViolations(rootDir), [
        'ui/runtime/rogueCssBridge.js:3: root.style.setProperty(name, value);',
    ]);
});
