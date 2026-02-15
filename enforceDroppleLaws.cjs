const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 4-Zone Model (Strict, Downward Only)
// PRODUCT -> UI -> ENGINE -> DOMAIN
// DOMAIN: core/, design/, timeline/, contracts/, validation/
// ENGINE: runtime/, engine/, input/, world/
// UI: ui/, canvas/, inspector/, workspace/, canvas/render/, ui/layout/
// PRODUCT: app/, convex/, persistence/, export/, share/, marketplace/, onboarding/, auth/, collaboration/

const ROOT = process.cwd();
const AI_DIR = path.join(ROOT, '.ai');
if (!fs.existsSync(AI_DIR)) fs.mkdirSync(AI_DIR);

const IGNORE = ['node_modules', '.git', '.next', 'dist', 'build', '.ai'];

const ZONES = [
    {
        name: 'domain',
        prefixes: ['core/', 'design/', 'timeline/', 'contracts/', 'validation/'],
    },
    {
        name: 'engine',
        prefixes: ['runtime/', 'engine/', 'input/', 'world/'],
    },
    {
        name: 'ui',
        prefixes: ['ui/', 'canvas/', 'inspector/', 'workspace/', 'canvas/render/', 'ui/layout/'],
    },
    {
        name: 'product',
        prefixes: [
            'app/',
            'convex/',
            'persistence/',
            'export/',
            'share/',
            'marketplace/',
            'onboarding/',
            'auth/',
            'collaboration/',
        ],
    },
];

const DROPPLE_LAWS = {
    selectionAuthority: ['SelectionContext', 'useSelectionStore'],
    createNode: 'createNode',
    reducerPattern: /Reducers?$/,
    timelineEvaluators: ['evaluateTimeline', 'evaluateAnimationTimeline', 'evaluateAnimationAtTime'],
};

const ZONE_RANK = {
    domain: 0,
    engine: 1,
    ui: 2,
    product: 3,
};

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const SEVERITY = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
};

function hash(content) {
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function extractExports(content) {
    const regex = /export\s+(?:const|function|class|interface|type)\s+([A-Za-z0-9_]+)/g;
    const exports = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        exports.push(match[1]);
    }
    return exports;
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

function walk(dir, result = []) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        if (IGNORE.includes(entry)) continue;
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walk(full, result);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
            const content = fs.readFileSync(full, 'utf8');
            result.push({
                path: path.relative(ROOT, full),
                hash: hash(content),
                mtime: stat.mtimeMs,
                content,
                exports: extractExports(content),
                imports: extractImports(content),
            });
        }
    }
    return result;
}

function detectZone(filePath) {
    for (const zone of ZONES) {
        for (const prefix of zone.prefixes) {
            if (filePath.includes(prefix)) return zone.name;
        }
    }
    return 'product';
}

function resolveImportPath(fromPath, imp, fileIndex) {
    if (!imp || typeof imp !== 'string') return null;

    const resolveWithExtensions = (candidate) => {
        const rel = path.relative(ROOT, candidate);
        if (fileIndex.has(rel)) return rel;
        for (const ext of EXTENSIONS) {
            const relExt = `${rel}${ext}`;
            if (fileIndex.has(relExt)) return relExt;
        }
        for (const ext of EXTENSIONS) {
            const relIndex = path.join(rel, `index${ext}`);
            if (fileIndex.has(relIndex)) return relIndex;
        }
        return null;
    };

    if (imp.startsWith('@/')) {
        const rel = imp.replace(/^@\//, '');
        return resolveWithExtensions(path.join(ROOT, rel));
    }

    if (imp.startsWith('.')) {
        const fromDir = path.dirname(path.join(ROOT, fromPath));
        const candidate = path.resolve(fromDir, imp);
        return resolveWithExtensions(candidate);
    }

    return null;
}

function findModuleCycles(importGraph, filesByPath) {
    const visiting = new Set();
    const visited = new Set();
    const stack = [];
    const cycles = [];
    const seen = new Set();

    function normalizeCycle(cycle) {
        const nodes = cycle.slice(0, -1);
        const rotations = [];
        for (let i = 0; i < nodes.length; i += 1) {
            rotations.push(nodes.slice(i).concat(nodes.slice(0, i)));
        }
        rotations.sort((a, b) => a.join('->').localeCompare(b.join('->')));
        return rotations[0].join('->');
    }

    function dfs(node) {
        visiting.add(node);
        stack.push(node);

        const edges = importGraph[node]?.imports || [];
        for (const next of edges) {
            if (!importGraph[next]) continue;
            if (visiting.has(next)) {
                const idx = stack.indexOf(next);
                const cycle = stack.slice(idx).concat(next);
                const signature = normalizeCycle(cycle);
                if (!seen.has(signature)) {
                    seen.add(signature);
                    cycles.push(cycle);
                }
            } else if (!visited.has(next)) {
                dfs(next);
            }
        }

        stack.pop();
        visiting.delete(node);
        visited.add(node);
    }

    Object.keys(importGraph).forEach((node) => {
        if (!visited.has(node)) dfs(node);
    });

    return cycles;
}

function run() {
    const files = walk(ROOT);
    const fileIndex = new Map(files.map((f) => [f.path, f]));

    const exportMap = {};
    const importGraph = {};
    const reducerDomains = {};
    const createNodeLocations = [];
    const selectionAuthorities = [];
    const timelineEvaluators = [];
    const crossZoneViolations = [];
    const upwardLeaks = [];
    const zonePurityViolations = [];

    files.forEach((f) => {
        f.zone = detectZone(f.path);

        importGraph[f.path] = importGraph[f.path] || { imports: [], importedBy: [] };

        f.exports.forEach((exp) => {
            if (!exportMap[exp]) exportMap[exp] = [];
            exportMap[exp].push(f.path);

            if (exp === DROPPLE_LAWS.createNode) createNodeLocations.push(f.path);
            if (DROPPLE_LAWS.reducerPattern.test(exp)) {
                reducerDomains[exp] = reducerDomains[exp] || [];
                reducerDomains[exp].push(f.path);
            }
            if (DROPPLE_LAWS.timelineEvaluators.includes(exp)) timelineEvaluators.push(f.path);
            if (DROPPLE_LAWS.selectionAuthority.includes(exp)) selectionAuthorities.push(f.path);
        });
    });

    files.forEach((f) => {
        f.imports.forEach((imp) => {
            const resolvedPath = resolveImportPath(f.path, imp, fileIndex);
            if (!resolvedPath) return;

            importGraph[f.path].imports.push(resolvedPath);
            importGraph[resolvedPath].importedBy.push(f.path);

            const targetZone = detectZone(resolvedPath);
            const fromRank = ZONE_RANK[f.zone];
            const toRank = ZONE_RANK[targetZone];

            if (fromRank < toRank) {
                upwardLeaks.push({
                    from: f.path,
                    to: resolvedPath,
                    fromZone: f.zone,
                    toZone: targetZone,
                });
                crossZoneViolations.push({
                    from: f.path,
                    to: resolvedPath,
                    fromZone: f.zone,
                    toZone: targetZone,
                });
                zonePurityViolations.push({
                    from: f.path,
                    to: resolvedPath,
                    fromZone: f.zone,
                    toZone: targetZone,
                });
            }
        });
    });

    const moduleCycles = findModuleCycles(importGraph, fileIndex);
    const crossZoneCycles = moduleCycles.filter((cycle) => {
        const zoneSet = new Set(cycle.map((p) => detectZone(p)));
        return zoneSet.size > 1;
    });

    const centralModules = Object.entries(importGraph)
        .map(([file, data]) => ({
            file,
            fanIn: data.importedBy.length,
            fanOut: data.imports.length,
        }))
        .sort((a, b) => b.fanIn - a.fanIn)
        .slice(0, 10);

    const recentFiles = files
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, 10)
        .map((f) => f.path);

    const reducerConflicts = Object.entries(reducerDomains).filter(([_, paths]) => paths.length > 1);
    const canonicalEvaluatorCount = timelineEvaluators.filter((p) =>
        p.endsWith('timeline/evaluateTimeline.js'),
    ).length;
    const errors = [];
    const warnings = [];
    const infos = [];

    const report = (severity, message) => {
        if (severity === SEVERITY.ERROR) errors.push(message);
        else if (severity === SEVERITY.WARN) warnings.push(message);
        else infos.push(message);
    };

    if (canonicalEvaluatorCount !== 1) {
        report(
            SEVERITY.ERROR,
            `Dropple Law: expected exactly one canonical evaluateTimeline at timeline/evaluateTimeline.js (found ${canonicalEvaluatorCount})`,
        );
    }

    if (upwardLeaks.length > 0) {
        report(
            SEVERITY.ERROR,
            `Dropple Law: upward layer leaks detected (${upwardLeaks.length})`,
        );
    }

    if (crossZoneCycles.length > 0) {
        report(
            SEVERITY.ERROR,
            `Dropple Law: cross-zone module cycles detected (${crossZoneCycles.length})`,
        );
    }

    if (crossZoneViolations.length > 0) {
        report(
            SEVERITY.ERROR,
            `Dropple Law: cross-zone violations detected (${crossZoneViolations.length})`,
        );
    }

    if (zonePurityViolations.length > 0) {
        report(
            SEVERITY.ERROR,
            `Dropple Law: zone purity violations detected (${zonePurityViolations.length})`,
        );
    }

    const dependencySnapshotPath = path.join(AI_DIR, 'dependency-graph.json');
    const currentSnapshot = {
        generatedAt: new Date().toISOString(),
        moduleCount: files.length,
        modules: Object.entries(importGraph).reduce((acc, [file, data]) => {
            acc[file] = {
                zone: detectZone(file),
                fanIn: data.importedBy.length,
                fanOut: data.imports.length,
            };
            return acc;
        }, {}),
    };

    fs.writeFileSync(dependencySnapshotPath, JSON.stringify(currentSnapshot, null, 2));

    const mostCoupled = Object.entries(importGraph)
        .map(([file, data]) => ({ file, fanOut: data.imports.length }))
        .sort((a, b) => b.fanOut - a.fanOut)
        .slice(0, 10);

    const mostDepended = Object.entries(importGraph)
        .map(([file, data]) => ({ file, fanIn: data.importedBy.length }))
        .sort((a, b) => b.fanIn - a.fanIn)
        .slice(0, 10);

    const systemContext = {
        snapshot: {
            totalModules: files.length,
            zones: files.reduce((acc, f) => {
                acc[f.zone] = (acc[f.zone] || 0) + 1;
                return acc;
            }, {}),
        },
        violations: {
            selectionAuthorities,
            createNodeLocations,
            reducerConflicts,
            timelineEvaluators,
            crossZoneViolations,
            upwardLeaks,
            zonePurityViolations,
        },
        centralModules,
        recentFiles,
    };

    fs.writeFileSync(path.join(AI_DIR, 'system-context.json'), JSON.stringify(systemContext, null, 2));

    fs.writeFileSync(
        path.join(AI_DIR, 'system-context.md'),
        `# Dropple AI System Context

## Snapshot
Total Modules: ${systemContext.snapshot.totalModules}

Zones:
${Object.entries(systemContext.snapshot.zones)
    .map(([z, count]) => `- ${z}: ${count}`)
    .join('\n')}

## Central Modules
${centralModules.map((m) => `- ${m.file} (fanIn: ${m.fanIn})`).join('\n')}

## Recently Modified
${recentFiles.map((f) => `- ${f}`).join('\n')}

## Violations
Selection Authorities: ${selectionAuthorities.length}
createNode Locations: ${createNodeLocations.length}
Reducer Conflicts: ${reducerConflicts.length}
Timeline Evaluators: ${timelineEvaluators.length}
Cross-Zone Imports: ${crossZoneViolations.length}
`,
    );

    console.log('\n🧠 Dropple Context Exported to .ai/system-context.md');
    console.log(`\nArchitecture Summary:`);
    console.log(`- Modules by Zone:`);
    Object.entries(systemContext.snapshot.zones).forEach(([zone, count]) => {
        console.log(`  - ${zone}: ${count}`);
    });
    console.log(`- Total cycles (cross-zone): ${crossZoneCycles.length}`);
    console.log(`- Cross-zone violations: ${crossZoneViolations.length}`);
    console.log(`- Upward leaks: ${upwardLeaks.length}`);
    console.log(`- Zone purity violations: ${zonePurityViolations.length}`);
    console.log(`- Most coupled modules (fanOut):`);
    mostCoupled.forEach((m) => console.log(`  - ${m.file} (${m.fanOut})`));
    console.log(`- Most depended modules (fanIn):`);
    mostDepended.forEach((m) => console.log(`  - ${m.file} (${m.fanIn})`));

    const violationKeys = new Set();
    crossZoneViolations.forEach((v) =>
        violationKeys.add(`${v.from}->${v.to}:${v.fromZone}->${v.toZone}`),
    );
    upwardLeaks.forEach((v) => violationKeys.add(`${v.from}->${v.to}:${v.fromZone}->${v.toZone}`));
    zonePurityViolations.forEach((v) =>
        violationKeys.add(`${v.from}->${v.to}:${v.fromZone}->${v.toZone}`),
    );
    let healthScore = 100 - violationKeys.size * 5;
    if (healthScore < 0) healthScore = 0;

    console.log(`\nArchitecture Health: ${healthScore} / 100`);

    if (errors.length > 0) {
        console.error(`\n${SEVERITY.ERROR} (${errors.length})`);
        errors.forEach((message) => console.error(`- ${message}`));
    }

    if (warnings.length > 0) {
        console.warn(`\n${SEVERITY.WARN} (${warnings.length})`);
        warnings.forEach((message) => console.warn(`- ${message}`));
    }

    if (infos.length > 0) {
        console.log(`\n${SEVERITY.INFO} (${infos.length})`);
        infos.forEach((message) => console.log(`- ${message}`));
    }

    if (errors.length > 0) {
        if (crossZoneViolations.length > 0) {
            console.error(`\nCross-Zone Violations:`);
            crossZoneViolations.slice(0, 50).forEach((violation) => {
                console.error(
                    `- ${violation.from} (${violation.fromZone}) -> ${violation.to} (${violation.toZone})`,
                );
            });
        }
        if (upwardLeaks.length > 0) {
            console.error(`\nUpward Leaks:`);
            upwardLeaks.slice(0, 20).forEach((leak) => {
                console.error(`- ${leak.from} (${leak.fromZone}) -> ${leak.to} (${leak.toZone})`);
            });
        }
        if (crossZoneCycles.length > 0) {
            crossZoneCycles.slice(0, 10).forEach((cycle) => {
                console.error(`- ${cycle.join(' → ')}`);
            });
        }
        if (zonePurityViolations.length > 0) {
            console.error(`\nZone Purity Violations:`);
            zonePurityViolations.slice(0, 50).forEach((violation) => {
                console.error(
                    `- ${violation.from} (${violation.fromZone}) -> ${violation.to} (${violation.toZone})`,
                );
            });
        }
        process.exit(1);
    }
}

run();
