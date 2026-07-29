import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
    getArchitectureIgnoreDirs,
    shouldIgnoreArchitecturePath,
} from '../../scripts/architectureIgnorePolicy.mjs';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = getArchitectureIgnoreDirs();

const SESSION_IDENTITY_QUERY_PATTERNS = [
    /\.get\(['"]language['"]\)/,
    /\.get\(['"]category['"]\)/,
    /\.get\(['"]blueprint['"]\)/,
    /\.get\(['"]blueprintVersionId['"]\)/,
    /\.get\(['"]template['"]\)/,
    /\.get\(['"]templateVersionId['"]\)/,
    /\.get\(['"]grammar['"]\)/,
    /\.get\(['"]blueprintCertification['"]\)/,
    /\.get\(['"]templateCertification['"]\)/,
    /\.get\(['"]launchContextVersion['"]\)/,
];

const RUNTIME_DIRS = ['ui/workspace', 'runtime/workspaces'];
const ALLOWLIST = new Set([
    'runtime/workspaces/workspaceLaunchContext.js',
]);

function shouldIgnore(relPath) {
    return shouldIgnoreArchitecturePath(relPath, IGNORE_DIRS);
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

function readRuntimeSourceFiles() {
    return RUNTIME_DIRS.flatMap((relDir) => walk(path.join(ROOT, relDir), relDir));
}

test('workspace session authority law: runtime modules never derive session identity from route/query state', () => {
    const violations = readRuntimeSourceFiles()
        .filter(({ relPath }) => !relPath.includes('/__tests__/'))
        .filter(({ relPath }) => !ALLOWLIST.has(relPath))
        .flatMap(({ fullPath, relPath }) => {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
            return lines
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => SESSION_IDENTITY_QUERY_PATTERNS.some((pattern) => pattern.test(line)))
                .map(({ line, index }) => `${relPath}:${index + 1}: ${line.trim()}`);
        });

    assert.deepEqual(violations, []);
});
