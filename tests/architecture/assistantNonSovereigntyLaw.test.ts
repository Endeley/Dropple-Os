import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ASSISTANTS_ROOT = path.join(process.cwd(), 'runtime/assistants');
const ALLOWED_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']);

function walk(dir, relBase = 'runtime/assistants') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = `${relBase}/${entry.name}`;
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

test('assistant runtime modules remain capability-only and non-sovereign', () => {
    const files = walk(ASSISTANTS_ROOT);

    const forbiddenPatterns = [
        /useRuntimeStore\.setState\s*\(/,
        /useAnimatedRuntimeStore\.setState\s*\(/,
        /canvasBus\.emit\s*\(/,
        /\.mutate\s*\(/,
    ];

    for (const file of files) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        for (const pattern of forbiddenPatterns) {
            assert.equal(
                pattern.test(content),
                false,
                `forbidden authority pattern matched in ${file.relPath}: ${pattern}`,
            );
        }
    }

    const registry = fs.readFileSync(path.join(ASSISTANTS_ROOT, 'registry.js'), 'utf8');
    assert.match(registry, /AI_REQUEST_ENQUEUE/);
});
