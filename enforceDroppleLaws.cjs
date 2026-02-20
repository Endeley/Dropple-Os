#!/usr/bin/env node

/**
 * Dropple Authority Audit (Strict Philosophy Mode)
 *
 * Structural enforcement only.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, '.ai');
if (!fs.existsSync(AI_DIR)) fs.mkdirSync(AI_DIR);

const IGNORE = ['node_modules', '.git', '.next', 'dist', 'build', '.ai'];
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Layer hierarchy (lower = deeper)
 */
const LAYERS = [
    { name: 'core', prefix: 'core/' },
    { name: 'core', prefix: 'timeline/' },
    { name: 'core', prefix: 'design/' },
    { name: 'core', prefix: 'contracts/' },
    { name: 'core', prefix: 'validation/' },
    { name: 'core', prefix: 'workspaces/' },
    { name: 'core', prefix: 'canvas/' },

    // Dispatcher is part of runtime, not a higher layer
    { name: 'runtime', prefix: 'runtime/dispatcher/' },

    { name: 'runtime', prefix: 'runtime/' },
    { name: 'infrastructure', prefix: 'infrastructure/' },
    { name: 'infrastructure', prefix: 'persistence/' },
    { name: 'workspace', prefix: 'workspace/' },

    { name: 'ui', prefix: 'ui/' },
    { name: 'product', prefix: 'app/' },
];

const LAYER_RANK = {
    core: 0,
    infrastructure: 1,
    runtime: 2,
    workspace: 3,
    ui: 4,
    product: 5,
};

const SEMANTIC_RANK = LAYER_RANK;

const PROJECTION_PREFIX = 'runtime/projection/';
const AUTHORITY_BRIDGE_PREFIX = 'ui/interaction/bridges/';
const REDUCER_IMPORTS = ['core/events/reducers', 'core/events/applyEvent.js'];
const MUTATION_FUNNEL_IMPORTS = [
    'core/events/reducers',
    'core/events/applyEvent.js',
    'core/mutationContext.js',
];
const MUTATION_FUNNEL_PREFIX = 'runtime/dispatcher/';

const UI_RUNTIME_STATE_PREFIX = 'runtime/state/';
const UI_PROJECTION_INTERNAL_PREFIX = 'runtime/projection/v1/internal/';

const PROJECTION_ALLOWED_RUNTIME_IMPORTS = new Set([
    'runtime/state/runtimeState.internal.js',
    'runtime/state/workspaceState.js',
]);

function detectLayer(filePath) {
    for (const layer of LAYERS) {
        if (filePath.startsWith(layer.prefix)) {
            return layer.name;
        }
    }
    return 'product';
}

function hash(content) {
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function walk(dir, result = []) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        if (IGNORE.includes(entry)) continue;
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            walk(full, result);
        } else if (/\.(js|jsx|ts|tsx)$/.test(entry)) {
            const content = fs.readFileSync(full, 'utf8');
            result.push({
                path: path.relative(ROOT, full),
                content,
                hash: hash(content),
            });
        }
    }
    return result;
}

function extractImports(content) {
    const regex = /import\s+.*?from\s+['"](.*?)['"]/g;
    const imports = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        imports.push(match[1]);
    }
    return imports;
}

function resolveImport(fromPath, imp, fileMap) {
    if (!imp || typeof imp !== 'string') return null;

    if (imp.startsWith('@/')) {
        const rel = imp.replace(/^@\//, '');
        return fileMap.get(rel) ? rel : null;
    }

    if (imp.startsWith('.')) {
        const base = path.dirname(fromPath);
        const candidate = path.normalize(path.join(base, imp));
        for (const ext of EXTENSIONS) {
            if (fileMap.get(candidate + ext)) return candidate + ext;
        }
    }

    return null;
}

function run() {
    const files = walk(ROOT);
    const fileMap = new Map(files.map((f) => [f.path, f]));

    const uiRuntimeStateViolations = [];
    let violationCount = 0;

    files.forEach((f) => {
        const imports = extractImports(f.content);

        imports.forEach((imp) => {
            const resolved = resolveImport(f.path, imp, fileMap);
            if (!resolved) return;

            const fromLayer = detectLayer(f.path);
            const toLayer = detectLayer(resolved);

            const fromLayerRank = SEMANTIC_RANK[fromLayer];
            const toLayerRank = SEMANTIC_RANK[toLayer];

            if (fromLayerRank < toLayerRank) {
                console.error(`ARCHITECTURE VIOLATION: ${f.path} (${fromLayer}) importing ${resolved} (${toLayer})`);
                violationCount += 1;
                process.exit(1);
            }

            if (
                MUTATION_FUNNEL_IMPORTS.some((blocked) => resolved.startsWith(blocked)) &&
                !f.path.startsWith(MUTATION_FUNNEL_PREFIX)
            ) {
                console.error(
                    `MUTATION FUNNEL VIOLATION: ${f.path} must not import ${resolved} (only runtime/dispatcher allowed)`
                );
                violationCount += 1;
                process.exit(1);
            }

            if (fromLayer === 'ui') {
                if (resolved.startsWith('runtime/dispatcher/') && !f.path.startsWith(AUTHORITY_BRIDGE_PREFIX)) {
                    console.error(`UI DISPATCHER VIOLATION: ${f.path} must not import dispatcher (${resolved})`);
                    violationCount += 1;
                    process.exit(1);
                }

                if (resolved.startsWith(UI_RUNTIME_STATE_PREFIX)) {
                    uiRuntimeStateViolations.push({
                        file: f.path,
                        resolved,
                    });
                    console.error(`UI RUNTIME STATE VIOLATION: ${f.path} importing ${resolved}`);
                    violationCount += 1;
                    process.exit(1);
                }

                if (resolved.startsWith(UI_PROJECTION_INTERNAL_PREFIX)) {
                    console.error(`UI PROJECTION INTERNAL VIOLATION: ${f.path} importing ${resolved}`);
                    violationCount += 1;
                    process.exit(1);
                }

                if (resolved.startsWith('runtime/projection/v1/')) {
                    console.error(`UI PROJECTION VERSION LOCK: ${f.path} importing ${resolved}`);
                    violationCount += 1;
                    process.exit(1);
                }
            }

            if (f.path.startsWith(PROJECTION_PREFIX)) {
                if (resolved.startsWith('runtime/dispatcher/')) {
                    console.error(`PROJECTION VIOLATION: ${f.path} importing dispatcher`);
                    violationCount += 1;
                    process.exit(1);
                }

                if (resolved.startsWith('runtime/state/') && !PROJECTION_ALLOWED_RUNTIME_IMPORTS.has(resolved)) {
                    console.error(`PROJECTION VIOLATION: ${f.path} importing illegal runtime/state`);
                    violationCount += 1;
                    process.exit(1);
                }

                if (REDUCER_IMPORTS.some((bad) => resolved.includes(bad))) {
                    console.error(`PROJECTION VIOLATION: ${f.path} importing reducers`);
                    violationCount += 1;
                    process.exit(1);
                }
            }
        });
    });

    fs.writeFileSync(
        path.join(AI_DIR, 'ui-runtime-state-violations.json'),
        JSON.stringify(uiRuntimeStateViolations, null, 2)
    );

    const healthScore = Math.max(0, 100 - violationCount * 2);

    console.log('\n🧠 Dropple Authority Audit Complete');
    console.log(`Total Modules: ${files.length}`);
    console.log(`Violations: ${violationCount}`);
    console.log(`Architecture Health: ${healthScore}/100`);
}

run();
