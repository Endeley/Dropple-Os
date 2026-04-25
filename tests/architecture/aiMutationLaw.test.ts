import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const AI_RUNTIME_PATH = path.join(ROOT, 'ai/runtime/aiRuntime.js');
const AI_ROOT = path.join(ROOT, 'ai');
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

function walk(dir, relBase = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
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

test('ai runtime dispatches only AI request lifecycle events', () => {
    const content = fs.readFileSync(AI_RUNTIME_PATH, 'utf8');
    const matches = Array.from(content.matchAll(/type:\s*EventTypes\.([A-Z0-9_]+)/g)).map(
        (match) => match[1],
    );

    assert.deepEqual(
        [...new Set(matches)].sort(),
        ['AI_REQUEST_COMPLETE', 'AI_REQUEST_ENQUEUE', 'AI_REQUEST_FAIL'],
    );
});

test('ai modules do not write runtime or document truth directly', () => {
    const violations = [];
    const files = walk(AI_ROOT, 'ai');

    for (const file of files) {
        if (file.relPath.startsWith('ai/__tests__/')) continue;

        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            const hitsDirectMutation =
                /useRuntimeStore\.setState\s*\(/.test(line) ||
                /useAnimatedRuntimeStore\.setState\s*\(/.test(line) ||
                /canvasBus\.emit\s*\(/.test(line) ||
                /\.mutate\s*\(/.test(line);

            if (hitsDirectMutation) {
                violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});
