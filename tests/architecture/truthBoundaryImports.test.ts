import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = new Set(['.git', '.next', 'node_modules', 'out', 'build']);

function shouldIgnore(relPath) {
    const normalized = relPath.replaceAll('\\', '/');
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

function collectViolations(scopePrefix, forbiddenPatterns) {
    const violations = [];
    const files = walk(path.join(ROOT, scopePrefix), scopePrefix);

    for (const file of files) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (!line.includes('import') && !line.includes('import(')) return;
            if (forbiddenPatterns.some((pattern) => pattern.test(line))) {
                violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    return violations;
}

function collectUiNonBridgeViolations(forbiddenPatterns) {
    const violations = [];
    const files = walk(path.join(ROOT, 'ui'), 'ui');

    for (const file of files) {
        const normalized = file.relPath.replaceAll('\\', '/');
        if (normalized.includes('/bridges/')) continue;

        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (!line.includes('import') && !line.includes('import(')) return;
            if (forbiddenPatterns.some((pattern) => pattern.test(line))) {
                violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    return violations;
}

test('workspaces do not import reducers directly', () => {
    const violations = collectViolations('workspaces', [
        /core\/events\/reducers\//,
        /from ['"].*reducers\//,
        /engine\//,
        /runtime\//,
    ]);

    assert.deepEqual(violations, []);
});

test('external plugins do not import runtime engine or reducer internals directly', () => {
    const pluginsRoot = path.join(ROOT, 'plugins');
    if (!fs.existsSync(pluginsRoot)) {
        assert.ok(true);
        return;
    }

    const violations = collectViolations('plugins', [
        /runtime\//,
        /engine\//,
        /core\/events\/reducers\//,
        /runtime\/state\//,
    ]);

    assert.deepEqual(violations, []);
});

test('ai modules do not import reducer dispatcher runtime-state or engine internals directly', () => {
    const aiRoot = path.join(ROOT, 'ai');
    if (!fs.existsSync(aiRoot)) {
        assert.ok(true);
        return;
    }

    const violations = collectViolations('ai', [
        /core\/events\/reducers\//,
        /runtime\/state\//,
        /runtime\/dispatcher\//,
        /engine\//,
    ]).filter((entry) => !entry.startsWith('ai/__tests__/'));

    assert.deepEqual(violations, []);
});

test('ui modules do not import engine or mutation-funnel internals directly', () => {
    const violations = collectViolations('ui', [
        /engine\//,
        /core\/events\/reducers\//,
        /core\/events\/applyEvent\.js/,
        /core\/mutationContext\.js/,
        /runtime\/state\//,
    ]);

    assert.deepEqual(violations, []);
});

test('non-bridge ui modules do not import runtime implementation paths directly', () => {
    const violations = collectUiNonBridgeViolations([
        /runtime\/input\//,
        /runtime\/interactions\//,
        /runtime\/selection\//,
        /runtime\/commands\//,
        /runtime\/hitTest\//,
        /runtime\/persistence\//,
        /runtime\/frame\//,
        /runtime\/instrumentation\//,
        /runtime\/tools\//,
        /runtime\/dispatcher\//,
    ]);

    assert.deepEqual(violations, []);
});

test('non-core modules do not import legacy selector entrypoints directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'workspaces', 'tests', 'runtime'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');

            if (normalized === 'runtime/projection/selectors/sceneSelectors.js') continue;
            if (normalized.startsWith('tests/')) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                if (
                    /core\/scene\/selectors\.v1/.test(line) ||
                    /runtime\/projection\/v1\/selectors/.test(line)
                ) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});
