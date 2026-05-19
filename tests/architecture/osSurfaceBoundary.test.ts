import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SURFACE_ROOT = path.join(ROOT, 'runtime/osSurface');
const ALLOWED_EXT = new Set(['.js', '.mjs']);

function walk(dir, relBase = 'runtime/osSurface') {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relPath = `${relBase}/${entry.name}`;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath, relPath));
            continue;
        }
        if (!entry.isFile()) continue;
        if (!ALLOWED_EXT.has(path.extname(entry.name))) continue;
        files.push(relPath);
    }

    return files;
}

test('os surface remains projection-only and non-sovereign', () => {
    const files = walk(SURFACE_ROOT);
    assert.ok(files.length > 0, 'runtime/osSurface must contain source files');

    const violations = [];
    const forbidden = [
        /core\/events\/reducers\//,
        /runtime\/state\//,
        /runtime\/dispatcher\//,
        /runtime\/stores\/useRuntimeStore\.js/,
        /\buseRuntimeStore\b/,
        /\.setState\s*\(/,
    ];

    for (const relPath of files) {
        if (relPath.includes('/__tests__/')) continue;
        const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
        const lines = content.split('\n');
        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            if (!line.includes('import') && !line.includes('setState')) continue;
            if (forbidden.some((pattern) => pattern.test(line))) {
                violations.push(`${relPath}:${index + 1}: ${line.trim()}`);
            }
            if (
                /runtime\/projection\//.test(line) &&
                !/runtime\/projection\/index\.js/.test(line) &&
                /import/.test(line)
            ) {
                violations.push(`${relPath}:${index + 1}: deep runtime/projection import not allowed: ${line.trim()}`);
            }
        }
    }

    assert.deepEqual(violations, []);
});

test('ui-side os surface modules route only through the os surface bridge', () => {
    const uiRoot = path.join(ROOT, 'ui');
    if (!fs.existsSync(uiRoot)) {
        assert.ok(true);
        return;
    }

    const files = walk(uiRoot, 'ui').filter((relPath) => /ossurface/i.test(relPath));
    if (files.length === 0) {
        assert.ok(true);
        return;
    }

    const violations = [];
    for (const relPath of files) {
        if (relPath.includes('/__tests__/')) continue;
        const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
        const lines = content.split('\n');

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            if (!line.includes('import')) continue;

            if (
                /runtime\/dispatcher\//.test(line) ||
                /runtime\/stores\/useRuntimeStore\.js/.test(line) ||
                /core\/events\/reducers\//.test(line)
            ) {
                violations.push(`${relPath}:${index + 1}: ${line.trim()}`);
            }

            const isAllowedBridge =
                relPath.endsWith('ui/bridges/osSurfaceIntentBridge.js') ||
                relPath.endsWith('ui/bridges/osSurfaceReadBridge.js');
            if (/runtime\/osSurface\//.test(line) && !isAllowedBridge) {
                violations.push(
                    `${relPath}:${index + 1}: only os surface bridge files may import runtime/osSurface/*`,
                );
            }
        }
    }

    assert.deepEqual(violations, []);
});
