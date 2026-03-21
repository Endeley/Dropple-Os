import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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
    if (!fs.existsSync(dir)) return [];

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

function collectViolations({
    scopes,
    patterns,
    includeImportsOnly = false,
    exclude = [],
}) {
    const violations = [];
    const excluded = exclude.map((entry) => entry.replaceAll('\\', '/'));

    for (const scope of scopes) {
        const scopeRoot = path.join(ROOT, scope);
        const files = walk(scopeRoot, scope);

        for (const file of files) {
            const normalized = file.relPath.replaceAll('\\', '/');
            if (excluded.some((entry) => normalized === entry || normalized.startsWith(`${entry}/`))) {
                continue;
            }

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (includeImportsOnly && !line.includes('import') && !line.includes('import(')) return;
                if (patterns.some((pattern) => pattern.test(line))) {
                    violations.push(`${file.relPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }

    return violations;
}

export function runArchitectureGuard() {
    const guards = [
        {
            name: 'ui-direct-mutation',
            violations: collectViolations({
                scopes: ['ui', 'platform', 'workspaces', 'ai'],
                exclude: ['ui/__tests__', 'ui/bridges'],
                patterns: [
                    /runtimeState\.[A-Za-z0-9_.[\]]+\s*=/,
                    /nodesById\[[^\]]+\]\s*=/,
                    /node\.layout\.(x|y|width|height|rotation)\s*=/,
                    /node\.(x|y|width|height|rotation)\s*=/,
                ],
            }),
        },
        {
            name: 'interaction-engine-purity',
            violations: collectViolations({
                scopes: ['runtime/interaction'],
                exclude: ['runtime/interaction/__tests__'],
                patterns: [
                    /from ['"]react['"]/,
                    /from ['"].*ui\//,
                    /\bwindow\b/,
                    /\bdocument\b/,
                    /\bMath\.random\b/,
                    /\bDate\.now\b/,
                    /\bperformance\.now\b/,
                ],
            }),
        },
        {
            name: 'tool-registration-entry',
            violations: collectViolations({
                scopes: ['ui', 'runtime', 'platform', 'workspaces', 'app', 'core'],
                exclude: [
                    'ui/workspace/capabilities/capabilityRegistry.js',
                    'runtime/actions/toolActions.js',
                    'ui/__tests__',
                    'runtime/__tests__',
                ],
                patterns: [
                    /\bregisterTools\s*\(/,
                    /\bunregisterTools\s*\(/,
                ],
            }),
        },
        {
            name: 'ui-direct-tool-execution',
            violations: collectViolations({
                scopes: ['ui'],
                exclude: ['ui/bridges', 'ui/__tests__'],
                patterns: [
                    /\bgetToolHandler\s*\(/,
                    /\bregisterToolHandler\s*\(/,
                    /\bunregisterToolHandler\s*\(/,
                    /\bexecuteTool\s*\(/,
                    /\btoolController\.run\s*\(/,
                ],
            }),
        },
    ];

    const failed = guards.filter((guard) => guard.violations.length > 0);

    if (failed.length === 0) {
        console.log('Architecture guard: no violations found.');
        return;
    }

    console.error('Architecture guard violations found:\n');
    for (const guard of failed) {
        console.error(`${guard.name}:`);
        for (const violation of guard.violations) {
            console.error(`- ${violation}`);
        }
        console.error('');
    }

    process.exit(1);
}

const isEntrypoint =
    process.argv[1] &&
    pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isEntrypoint) {
    runArchitectureGuard();
}
