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
    { name: 'core', prefix: 'domain/' },
    { name: 'core', prefix: 'timeline/' },
    { name: 'core', prefix: 'design/' },
    { name: 'core', prefix: 'contracts/' },
    { name: 'core', prefix: 'validation/' },
    { name: 'core', prefix: 'canvas/' },
    { name: 'workspace', prefix: 'workspaces/' },

    { name: 'engine', prefix: 'engine/' },

    // Dispatcher is part of runtime, not a higher layer
    { name: 'runtime', prefix: 'runtime/dispatcher/' },

    { name: 'runtime', prefix: 'runtime/' },
    { name: 'workspace', prefix: 'workspace/' },
    { name: 'infrastructure', prefix: 'infrastructure/' },
    { name: 'ui', prefix: 'ui/' },
    { name: 'product', prefix: 'app/' },
];

const ALLOWED_ZONE_IMPORTS = {
    core: [],
    engine: ['core'],
    runtime: ['core', 'engine'],
    infrastructure: ['core'],
    workspace: ['runtime', 'engine', 'infrastructure', 'core'],
    ui: ['workspace', 'runtime', 'engine', 'infrastructure', 'core'],
    product: ['ui', 'workspace', 'runtime', 'engine', 'infrastructure', 'core'],
};

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

const WORKSPACE_REGISTRY_PREFIX = 'workspaces/registry/';
const WORKSPACE_DEFINITION_EXEMPT = new Set([
    'workspaces/registry/index.js',
    'workspaces/registry/resolveWorkspacePolicy.js',
    'workspaces/registry/WorkspaceDefinition.js',
    'workspaces/registry/routes.js',
    'workspaces/registry/timelineCapability.js',
    'workspaces/registry/canvasSurfacePolicy.js',
]);

const TOOL_PREFIX = 'ui/tools/';
const PANEL_SUFFIX = 'Panel.jsx';
const TOOL_ALLOWED_CORE = new Set(['core/events/eventTypes.js']);
const TOOL_DISALLOWED_PREFIXES = [
    'runtime/',
    'core/',
];
const TOOL_DISALLOWED_EXACT = new Set([
    'core/events/applyEvent.js',
    'core/mutationContext.js',
    'runtime/state/runtimeState.internal.js',
]);
const PANEL_DISALLOWED_EXACT = new Set([
    'runtime/state/runtimeState.internal.js',
    'core/events/applyEvent.js',
    'core/mutationContext.js',
]);

const ZONE_ENTRYPOINTS = new Set(['@core', '@engine', '@runtime', '@workspace', '@ui']);
const ZONE_DEEP_PREFIXES = [
    '@core/',
    '@engine/',
    '@runtime/',
    '@workspace/',
    '@ui/',
];

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

function isWorkspaceDefinitionFile(filePath) {
    if (!filePath.startsWith(WORKSPACE_REGISTRY_PREFIX)) return false;
    if (WORKSPACE_DEFINITION_EXEMPT.has(filePath)) return false;
    return true;
}

function hasWorkspaceDefinitionShape(content) {
    const hasId = /id\s*:\s*['"][^'"]+['"]/.test(content);
    const hasLabel = /label\s*:\s*['"][^'"]+['"]/.test(content);
    const hasCapabilities = /capabilities\s*:\s*(\{|\[)/.test(content);
    const hasAllowed = /allowedEventTypes\s*:\s*\[/.test(content);
    const hasTimeline = /timeline\s*:\s*/.test(content);
    return hasId && hasLabel && hasCapabilities && hasAllowed && hasTimeline;
}

function isToolFile(filePath) {
    return filePath.startsWith(TOOL_PREFIX);
}

function isPanelFile(filePath) {
    return filePath.endsWith(PANEL_SUFFIX);
}

function hasToolContractShape(content) {
    const hasId = /\bid\s*:\s*['"][^'"]+['"]/.test(content);
    const hasLabel = /\blabel\s*:\s*['"][^'"]+['"]/.test(content);
    return hasId && hasLabel;
}

function run() {
    const files = walk(ROOT);
    const fileMap = new Map(files.map((f) => [f.path, f]));

    const uiRuntimeStateViolations = [];
    let violationCount = 0;

    files.forEach((f) => {
        if (!isWorkspaceDefinitionFile(f.path)) return;
        if (!hasWorkspaceDefinitionShape(f.content)) {
            console.error(
                `WORKSPACE DEFINITION VIOLATION: ${f.path} must export a valid WorkspaceDefinition.`
            );
            violationCount += 1;
            process.exit(1);
        }
    });

    files.forEach((f) => {
        const imports = extractImports(f.content);
        const isTool = isToolFile(f.path);
        const isPanel = isPanelFile(f.path);

        if (isTool && !hasToolContractShape(f.content)) {
            console.error(`TOOL CONTRACT VIOLATION: ${f.path} must export { id, label }`);
            violationCount += 1;
            process.exit(1);
        }

        if (isTool) {
            if (/useRuntimeStore\.getState\(\)\.mutate/.test(f.content) || /runtimeState\.internal/.test(f.content)) {
                console.error(`TOOL MUTATION BYPASS VIOLATION: ${f.path} attempted direct state mutation`);
                violationCount += 1;
                process.exit(1);
            }
        }

        imports.forEach((imp) => {
            if (ZONE_DEEP_PREFIXES.some((prefix) => imp.startsWith(prefix))) {
                console.error(
                    `ZONE ENTRYPOINT VIOLATION: ${f.path} must import ${imp.split('/')[0]} via entrypoint (${imp})`
                );
                violationCount += 1;
                process.exit(1);
            }

            if (ZONE_ENTRYPOINTS.has(imp)) return;
            const resolved = resolveImport(f.path, imp, fileMap);
            if (!resolved) return;

            const fromLayer = detectLayer(f.path);
            const toLayer = detectLayer(resolved);

            const allowed = ALLOWED_ZONE_IMPORTS[fromLayer] ?? [];
            if (fromLayer !== toLayer && !allowed.includes(toLayer)) {
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

            if (isTool) {
                const isDisallowedPrefix = TOOL_DISALLOWED_PREFIXES.some((prefix) => resolved.startsWith(prefix));
                const isAllowedCore = TOOL_ALLOWED_CORE.has(resolved);

                if (TOOL_DISALLOWED_EXACT.has(resolved)) {
                    console.error(
                        `TOOL ARCHITECTURE VIOLATION: ${f.path} illegally imports runtime/core mutation path`
                    );
                    violationCount += 1;
                    process.exit(1);
                }

                if (resolved.startsWith('core/') && !isAllowedCore) {
                    console.error(
                        `TOOL ARCHITECTURE VIOLATION: ${f.path} illegally imports runtime/core mutation path`
                    );
                    violationCount += 1;
                    process.exit(1);
                }

                if (isDisallowedPrefix && !resolved.startsWith('core/')) {
                    console.error(
                        `TOOL ARCHITECTURE VIOLATION: ${f.path} illegally imports runtime/core mutation path`
                    );
                    violationCount += 1;
                    process.exit(1);
                }
            }

            if (isPanel) {
                if (PANEL_DISALLOWED_EXACT.has(resolved)) {
                    console.error(
                        `PANEL ARCHITECTURE VIOLATION: ${f.path} illegally imports mutation path`
                    );
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
    console.log('Dropple Constitutional Law Active.');
    console.log('Read docs/LAW.md before modifying architecture.');
}

run();
