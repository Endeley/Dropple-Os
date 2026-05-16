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

function shouldIgnore(relPath) {
    return shouldIgnoreArchitecturePath(relPath, IGNORE_DIRS);
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

test('non-bridge ui modules import projection only through the public runtime/projection entrypoint', () => {
    const violations = [];
    const files = walk(path.join(ROOT, 'ui'), 'ui');

    for (const file of files) {
        const normalized = file.relPath.replaceAll('\\', '/');
        if (normalized.includes('/bridges/')) continue;

        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (!line.includes('import') && !line.includes('import(')) return;

            const importsRawStore = /runtime\/stores\/useRuntimeStore\.js/.test(line);
            const importsDeepProjection =
                /runtime\/projection\//.test(line) &&
                !/runtime\/projection\/index\.js/.test(line);

            if (importsRawStore || importsDeepProjection) {
                violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
            }
        });
    }

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

test('non-workspace modules do not import workspace registry internals directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'tests', 'runtime'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');

            if (normalized === 'platform/workspaces/workspaceRegistry.js') continue;
            if (normalized === 'platform/workspaces/canvasSurfacePolicy.js') continue;
            if (normalized === 'platform/capabilities/workspaceRegistryBridge.js') continue;
            if (normalized.startsWith('tests/')) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                if (/workspaces\/registry(\/|['"])/.test(line)) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});

test('runtime navigation and state machine subsystems stay structurally separate', () => {
    const scopes = [
        {
            root: path.join(ROOT, 'runtime/navigation'),
            relBase: 'runtime/navigation',
            forbidden: /runtime\/stateMachines\//,
        },
        {
            root: path.join(ROOT, 'runtime/stateMachines'),
            relBase: 'runtime/stateMachines',
            forbidden: /runtime\/navigation\//,
        },
    ];

    const violations = [];

    for (const scope of scopes) {
        if (!fs.existsSync(scope.root)) continue;

        const files = walk(scope.root, scope.relBase);
        for (const file of files) {
            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                if (scope.forbidden.test(line)) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});

test('non-runtime modules do not import deep navigation or state-machine internals directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'tests', 'core'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');

            if (normalized.startsWith('tests/')) continue;
            if (normalized === 'runtime/projection/selectors/appSelectors.js') continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                const hitsDeepNavigation =
                    /runtime\/navigation\//.test(line) && !/runtime\/navigation\/index\.js/.test(line);
                const hitsDeepStateMachines =
                    /runtime\/stateMachines\//.test(line) &&
                    !/runtime\/stateMachines\/index\.js/.test(line);

                if (hitsDeepNavigation || hitsDeepStateMachines) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});

test('non-runtime modules do not import deep layout internals directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'tests', 'core', 'engine', 'branching'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');

            if (normalized.startsWith('tests/')) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                const hitsDeepLayout =
                    /runtime\/layout\//.test(line) && !/runtime\/layout\/index\.js/.test(line);

                if (hitsDeepLayout) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});

test('non-runtime modules do not import deep scene internals directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'tests', 'core', 'engine', 'branching'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');

            if (normalized.startsWith('tests/')) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                const hitsDeepScene =
                    /runtime\/scene\//.test(line) && !/runtime\/scene\/index\.js/.test(line);

                if (hitsDeepScene) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});

test('non-runtime modules do not import deep interaction internals directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'tests', 'core', 'engine', 'branching'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');

            if (normalized.startsWith('tests/')) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;

                const hitsDeepInteractions =
                    /runtime\/interactions\//.test(line) &&
                    !/runtime\/interactions\/index\.js/.test(line);
                const hitsDeepInteractionEngine =
                    /runtime\/interactionEngine\//.test(line) &&
                    !/runtime\/interactionEngine\/index\.js/.test(line);

                if (hitsDeepInteractions || hitsDeepInteractionEngine) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});

test('runtime evaluation authority routes transition and frame evaluators through render orchestration only', () => {
    const runtimeRoot = path.join(ROOT, 'runtime');
    if (!fs.existsSync(runtimeRoot)) {
        assert.ok(true);
        return;
    }

    const violations = [];
    const files = walk(runtimeRoot, 'runtime');

    for (const file of files) {
        const normalized = file.relPath.replaceAll('\\', '/');
        if (normalized.includes('/__tests__/')) continue;
        if (normalized === 'runtime/render/renderOrchestration.js') continue;

        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (!line.includes('import') && !line.includes('import(')) return;
            const importsTransitionEvaluator = /runtime\/transition\/evaluateTransitionFrame\.js/.test(line);
            const importsFrameEvaluator = /engine\/evaluation\/evaluateFrameAt\.js/.test(line);
            if (importsTransitionEvaluator || importsFrameEvaluator) {
                violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});

test('non-runtime modules do not import deep simulation internals directly', () => {
    const scopes = ['ui', 'platform', 'ai', 'tests', 'core', 'engine', 'branching'];
    const violations = [];

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        if (!fs.existsSync(scopeRoot)) continue;

        const files = walk(scopeRoot, scope);
        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');
            if (normalized.startsWith('tests/')) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (!line.includes('import') && !line.includes('import(')) return;
                const hitsDeepSimulation =
                    /runtime\/simulation\//.test(line) &&
                    !/runtime\/simulation\/index\.js/.test(line);

                if (hitsDeepSimulation) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    assert.deepEqual(violations, []);
});
