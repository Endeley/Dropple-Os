import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = new Set([
    '.git',
    '.next',
    'node_modules',
    'out',
    'build',
    'coverage',
    'test-results',
]);

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

function shouldIgnore(relPath) {
    const normalized = relPath.replaceAll('\\', '/');
    const [rootDir] = normalized.split('/');
    if (rootDir?.startsWith('.next')) return true;
    for (const item of IGNORE_DIRS) {
        if (normalized === item || normalized.startsWith(`${item}/`)) return true;
    }
    return false;
}

function walk(dir, relBase = '') {
    if (!fs.existsSync(dir)) return [];

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

function readAllSourceFiles() {
    return walk(ROOT);
}

function countTokenTableSignals(content) {
    return TOKEN_TABLE_PATTERNS.reduce(
        (count, pattern) => count + (pattern.test(content) ? 1 : 0),
        0,
    );
}

test('token authority law A: no legacy ui token imports remain', () => {
    const violations = readAllSourceFiles()
        .filter(({ relPath }) => !relPath.startsWith('tests/'))
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => IMPORT_STATEMENT.test(line) && TOKEN_IMPORT.test(line))
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });

    assert.deepEqual(violations, []);
});

test('token authority law B: token tables are defined only in canonical authority files', () => {
    const violations = readAllSourceFiles()
        .filter(({ relPath }) => !relPath.startsWith('tests/'))
        .filter(({ relPath }) => !TOKEN_TABLE_ALLOWLIST.has(relPath))
        .map(({ fullPath, relPath }) => ({
            relPath,
            signalCount: countTokenTableSignals(fs.readFileSync(fullPath, 'utf8')),
        }))
        .filter(({ signalCount }) => signalCount >= 3)
        .map(({ relPath, signalCount }) => `${relPath}: duplicate token table candidate (${signalCount} token groups)`);

    assert.deepEqual(violations, []);
});

test('token authority law C: CSS token projection is owned by a single bridge', () => {
    const violations = readAllSourceFiles()
        .filter(({ relPath }) => !relPath.startsWith('tests/'))
        .filter(({ relPath }) => relPath !== 'ui/bridges/tokenCssBridge.js')
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => CSS_SET_PROPERTY.test(line))
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });

    assert.deepEqual(violations, []);
});
