#!/usr/bin/env node

/**
 * Dropple Authority Audit (Strict Philosophy Mode)
 *
 * truth → domain → logic → mutation → evaluation → runtime → ui → product
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

    //  Debugger is part of runtime, not a higher layer
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

const PROJECTION_PREFIX = 'runtime/projection/';
const AUTHORITY_BRIDGE_PREFIX = 'ui/interaction/bridges/';
const REDUCER_IMPORTS = ['core/events/reducers', 'core/events/applyEvent.js'];

const UI_RUNTIME_STATE_PREFIX = 'runtime/state/';
const UI_PROJECTION_INTERNAL_PREFIX = 'runtime/projection/v1/internal/';

const PROJECTION_ALLOWED_RUNTIME_IMPORTS = new Set(['runtime/state/runtimeState.internal.js', 'runtime/state/workspaceState.js']);

function detectLayer(filePath) {
    for (const layer of LAYERS) {
        if (filePath.startsWith(layer.prefix)) {
            return layer.name;
        }
    }
    return 'product';
}

const AUTHORITY_RANK = {
    truth: 0,
    domain: 1,
    logic: 2,
    mutation: 3,
    evaluation: 4,
    runtime: 5,
    ui: 6,
    product: 7,
};

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

/**
 * Authority Classification (Improved Ordering)
 */
function detectAuthority(file) {
    const { path: filePath, content } = file;

    // UI
    if (/\.(jsx|tsx)$/.test(filePath) || content.includes('useState(')) {
        return 'ui';
    }

    // Product
    if (filePath.startsWith('app/') || filePath.startsWith('convex/') || filePath.startsWith('persistence/') || filePath.startsWith('export/') || filePath.startsWith('marketplace/') || filePath.startsWith('share/')) {
        return 'product';
    }

    // Truth
    if (filePath.includes('schema') || filePath.includes('contracts') || filePath.includes('ccm') || content.includes('interface ') || content.includes('type ')) {
        return 'truth';
    }

    // Mutation
    if (filePath.includes('reducer') || content.includes('applyEvent') || content.includes('mutationContext')) {
        return 'mutation';
    }

    // Evaluation
    if (filePath.includes('engine') || content.includes('evaluate') || content.includes('constraintEngine')) {
        return 'evaluation';
    }

    // Domain (moved BEFORE runtime)
    if (filePath.includes('validation') || filePath.includes('guard') || filePath.includes('constraint')) {
        return 'domain';
    }

    // Runtime
    if (filePath.includes('runtime') || content.includes('useRuntimeStore') || content.includes('dispatch(') || content.includes('MessageBus')) {
        return 'runtime';
    }

    return 'logic';
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

    const authorityMap = {};
    const violations = [];
    const uiRuntimeStateViolations = [];
    const mutationFiles = [];
    const truthFiles = [];

    files.forEach((f) => {
        f.authority = detectAuthority(f);
        authorityMap[f.path] = f.authority;

        if (f.authority === 'mutation') mutationFiles.push(f.path);
        if (f.authority === 'truth') truthFiles.push(f.path);
    });

    files.forEach((f) => {
        const imports = extractImports(f.content);

        imports.forEach((imp) => {
            const resolved = resolveImport(f.path, imp, fileMap);
            if (!resolved) return;

            const fromAuth = f.authority;
            const toAuth = authorityMap[resolved];

            const fromRank = AUTHORITY_RANK[fromAuth];
            const toRank = AUTHORITY_RANK[toAuth];

            const fromLayer = detectLayer(f.path);
            const toLayer = detectLayer(resolved);

            const fromLayerRank = LAYER_RANK[fromLayer];
            const toLayerRank = LAYER_RANK[toLayer];

            if (fromLayerRank < toLayerRank) {
                console.error(`ARCHITECTURE VIOLATION: ${f.path} (${fromLayer}) importing ${resolved} (${toLayer})`);
                process.exit(1);
            }

            if (fromLayer === 'ui') {
                if (resolved.startsWith('runtime/dispatcher/') && !f.path.startsWith(AUTHORITY_BRIDGE_PREFIX)) {
                    console.error(`UI DISPATCHER VIOLATION: ${f.path} must not import dispatcher (${resolved})`);
                    process.exit(1);
                }

                if (resolved.startsWith(UI_RUNTIME_STATE_PREFIX)) {
                    uiRuntimeStateViolations.push({
                        file: f.path,
                        resolved,
                    });
                    console.error(`UI RUNTIME STATE VIOLATION: ${f.path} importing ${resolved}`);
                    process.exit(1);
                }

                if (resolved.startsWith(UI_PROJECTION_INTERNAL_PREFIX)) {
                    console.error(`UI PROJECTION INTERNAL VIOLATION: ${f.path} importing ${resolved}`);
                    process.exit(1);
                }

                if (resolved.startsWith('runtime/projection/v1/')) {
                    console.error(`UI PROJECTION VERSION LOCK: ${f.path} importing ${resolved}`);
                    process.exit(1);
                }
            }

            if (f.path.startsWith(PROJECTION_PREFIX)) {
                if (resolved.startsWith('runtime/dispatcher/')) {
                    console.error(`PROJECTION VIOLATION: ${f.path} importing dispatcher`);
                    process.exit(1);
                }

                if (resolved.startsWith('runtime/state/') && !PROJECTION_ALLOWED_RUNTIME_IMPORTS.has(resolved)) {
                    console.error(`PROJECTION VIOLATION: ${f.path} importing illegal runtime/state`);
                    process.exit(1);
                }

                if (REDUCER_IMPORTS.some((bad) => resolved.includes(bad))) {
                    console.error(`PROJECTION VIOLATION: ${f.path} importing reducers`);
                    process.exit(1);
                }
            }

            if (fromRank < toRank) {
                violations.push({
                    type: 'UPWARD_AUTHORITY_LEAK',
                    from: f.path,
                    to: resolved,
                });
            }

            if (fromAuth === 'truth' && toAuth !== 'truth') {
                violations.push({
                    type: 'TRUTH_LEAK',
                    from: f.path,
                    to: resolved,
                });
            }

            if (toAuth === 'mutation' && fromAuth !== 'mutation') {
                violations.push({
                    type: 'EXTERNAL_MUTATION_ACCESS',
                    from: f.path,
                    to: resolved,
                });
            }
        });
    });

    fs.writeFileSync(path.join(AI_DIR, 'authority-map.json'), JSON.stringify(authorityMap, null, 2));
    fs.writeFileSync(path.join(AI_DIR, 'mutation-map.json'), JSON.stringify(mutationFiles, null, 2));
    fs.writeFileSync(path.join(AI_DIR, 'truth-map.json'), JSON.stringify(truthFiles, null, 2));
    fs.writeFileSync(path.join(AI_DIR, 'authority-violations.json'), JSON.stringify(violations, null, 2));
    fs.writeFileSync(path.join(AI_DIR, 'ui-runtime-state-violations.json'), JSON.stringify(uiRuntimeStateViolations, null, 2));

    const healthScore = Math.max(0, 100 - violations.length * 2);

    console.log('\n🧠 Dropple Authority Audit Complete');
    console.log(`Total Modules: ${files.length}`);
    console.log(`Truth Files: ${truthFiles.length}`);
    console.log(`Mutation Files: ${mutationFiles.length}`);
    console.log(`Violations: ${violations.length}`);
    console.log(`Architecture Health: ${healthScore}/100`);
}

run();
