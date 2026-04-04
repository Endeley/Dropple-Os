const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const IGNORE = ['node_modules', '.git', '.next', 'dist', 'build', '.ai'];

const CANONICAL_ZONES = {
    timeline: 'timeline/',
    runtime: 'runtime/state/',
    events: 'core/events/',
    transform: 'canvas/transform/',
    workspace: 'workspaces/registry/',
    creation: 'ui/interaction/',
    export: 'export/',
};

const DROPPLE_LAWS = {
    selectionAuthority: ['SelectionContext', 'useSelectionStore'],
    createNode: 'createNode',
    reducerPattern: /Reducers?$/,
    timelineEvaluators: ['evaluateTimeline', 'evaluateChannelTimeline', 'evaluatePreviewEvents'],
};

function hash(content) {
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function extractExports(content) {
    const exportRegex = /export\s+(?:const|function|class|interface|type)\s+([A-Za-z0-9_]+)/g;
    const exports = [];
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
    }
    return exports;
}

function extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
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
                content,
                exports: extractExports(content),
                imports: extractImports(content),
            });
        }
    }

    return result;
}

function detectZone(filePath) {
    for (const [zone, prefix] of Object.entries(CANONICAL_ZONES)) {
        if (filePath.includes(prefix)) return zone;
    }
    return null;
}

function run() {
    const files = walk(ROOT);

    const exportMap = {};
    const reducerDomains = {};
    const createNodeLocations = [];
    const selectionAuthorities = [];
    const timelineEvaluators = [];

    let crossZoneViolations = [];
    let duplicateCanonConflicts = [];

    files.forEach((f) => {
        f.zone = detectZone(f.path);

        // Build export map
        f.exports.forEach((exp) => {
            if (!exportMap[exp]) exportMap[exp] = [];
            exportMap[exp].push({ path: f.path, zone: f.zone });

            // Detect createNode
            if (exp === DROPPLE_LAWS.createNode) {
                createNodeLocations.push(f.path);
            }

            // Detect reducers
            if (DROPPLE_LAWS.reducerPattern.test(exp)) {
                if (!reducerDomains[exp]) reducerDomains[exp] = [];
                reducerDomains[exp].push(f.path);
            }

            // Detect timeline evaluators
            if (DROPPLE_LAWS.timelineEvaluators.includes(exp)) {
                timelineEvaluators.push({ name: exp, path: f.path });
            }

            // Detect selection authorities
            if (DROPPLE_LAWS.selectionAuthority.includes(exp)) {
                selectionAuthorities.push({ name: exp, path: f.path });
            }
        });
    });

    // Detect canonical export conflicts
    Object.entries(exportMap).forEach(([name, entries]) => {
        const zones = new Set(entries.map((e) => e.zone).filter(Boolean));
        if (zones.size > 1) {
            duplicateCanonConflicts.push({ name, entries });
        }
    });

    // Cross-zone import detection
    files.forEach((f) => {
        const sourceZone = f.zone;
        if (!sourceZone) return;

        f.imports.forEach((imp) => {
            const resolved = path.normalize(imp);
            const targetZone = detectZone(resolved);

            if (targetZone && targetZone !== sourceZone && sourceZone !== 'ui') {
                crossZoneViolations.push({
                    from: f.path,
                    fromZone: sourceZone,
                    to: imp,
                    toZone: targetZone,
                });
            }
        });
    });

    console.log('\n🧠 DROPPLE LAW ENFORCEMENT\n');

    // LAW 1: Single Selection Authority
    if (selectionAuthorities.length > 1) {
        console.log('❌ LAW VIOLATION: Multiple Selection Authorities detected:\n');
        selectionAuthorities.forEach((s) => console.log(`  - ${s.name} in ${s.path}`));
        console.log('');
    } else {
        console.log('✅ Single Selection Authority enforced.\n');
    }

    // LAW 2: Single createNode
    if (createNodeLocations.length > 1) {
        console.log('❌ LAW VIOLATION: Multiple createNode implementations:\n');
        createNodeLocations.forEach((p) => console.log(`  - ${p}`));
        console.log('');
    } else {
        console.log('✅ Single createNode implementation.\n');
    }

    // LAW 3: Duplicate reducer domains
    const reducerConflicts = Object.entries(reducerDomains).filter(([_, paths]) => paths.length > 1);

    if (reducerConflicts.length) {
        console.log('❌ LAW VIOLATION: Duplicate reducer domains:\n');
        reducerConflicts.forEach(([name, paths]) => {
            console.log(`  Reducer: ${name}`);
            paths.forEach((p) => console.log(`    - ${p}`));
            console.log('');
        });
    } else {
        console.log('✅ Reducer domains clean.\n');
    }

    // LAW 4: Multiple timeline evaluators
    if (timelineEvaluators.length > 1) {
        console.log('❌ LAW VIOLATION: Multiple Timeline Evaluators detected:\n');
        timelineEvaluators.forEach((t) => console.log(`  - ${t.name} in ${t.path}`));
        console.log('');
    } else {
        console.log('✅ Single timeline evaluator.\n');
    }

    // LAW 5: Canonical Ownership Conflicts
    if (duplicateCanonConflicts.length) {
        console.log('❌ Canonical Ownership Conflicts:\n');
        duplicateCanonConflicts.forEach((conflict) => {
            console.log(`  Export: ${conflict.name}`);
            conflict.entries.forEach((e) => console.log(`    - ${e.path} (${e.zone})`));
            console.log('');
        });
    } else {
        console.log('✅ Canonical ownership intact.\n');
    }

    // LAW 6: Cross-Zone Violations
    if (crossZoneViolations.length) {
        console.log('❌ Cross-Zone Import Violations:\n');
        crossZoneViolations.forEach((v) => console.log(`  ${v.from} (${v.fromZone}) importing ${v.to} (${v.toZone})`));
        console.log('');
    } else {
        console.log('✅ Zone isolation maintained.\n');
    }

    const hasViolation = selectionAuthorities.length > 1 || createNodeLocations.length > 1 || reducerConflicts.length || timelineEvaluators.length > 1 || duplicateCanonConflicts.length || crossZoneViolations.length;

    if (hasViolation) {
        console.log('🚨 Dropple Laws Violated. Fix before merge.');
        process.exit(1);
    } else {
        console.log('🎯 Dropple Laws Enforced. System Stable.');
    }
}

run();
