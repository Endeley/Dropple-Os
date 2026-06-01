import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const UI_ROOT = path.join(process.cwd(), 'ui');
const RUNTIME_PROJECTS_ROOT = path.join(process.cwd(), 'runtime/projects');
const ALLOWED_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx']);

function walkFiles(dir) {
    const stack = [dir];
    const files = [];
    while (stack.length) {
        const current = stack.pop();
        if (!current) continue;
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }
            if (!entry.isFile()) continue;
            if (!ALLOWED_EXT.has(path.extname(entry.name))) continue;
            files.push(fullPath);
        }
    }
    return files;
}

test('ui modules do not import runtime project registry authority directly', () => {
    const files = walkFiles(UI_ROOT);
    const forbiddenPatterns = [
        /from\s+['"]@\/runtime\/projects\/projectRegistry\.js['"]/,
        /from\s+['"]\.\.\/.*runtime\/projects\/projectRegistry\.js['"]/,
        /from\s+['"]\.\.\/\.\.\/.*runtime\/projects\/projectRegistry\.js['"]/,
    ];

    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        for (const pattern of forbiddenPatterns) {
            assert.equal(
                pattern.test(source),
                false,
                `UI must not import project registry authority directly: ${path.relative(process.cwd(), file)}`,
            );
        }
    }
});

test('runtime project registry stays pure and does not import ui or dispatcher internals', () => {
    const files = walkFiles(RUNTIME_PROJECTS_ROOT);
    const forbiddenPatterns = [
        /from\s+['"]@\/ui\//,
        /from\s+['"]@\/runtime\/dispatcher\//,
        /canvasBus\.emit\s*\(/,
    ];

    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        for (const pattern of forbiddenPatterns) {
            assert.equal(
                pattern.test(source),
                false,
                `runtime project registry must remain pure: ${path.relative(process.cwd(), file)}`,
            );
        }
    }
});
