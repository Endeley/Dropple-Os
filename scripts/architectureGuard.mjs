import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    getArchitectureIgnoreDirs,
    shouldIgnoreArchitecturePath,
} from './architectureIgnorePolicy.mjs';

const ROOT = process.cwd();
const ALLOWED_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const IGNORE_DIRS = getArchitectureIgnoreDirs();
const TOKEN_IMPORT = /@\/ui\/tokens\b/;
const CSS_SET_PROPERTY = /\.style\.setProperty\s*\(/;
const TOKEN_TABLE_PATTERNS = [
    /\bcolor\s*:\s*\{/,
    /\bspace\s*:\s*\{/,
    /\bradius\s*:\s*\{/,
    /\bmotion\s*:\s*\{/,
];
const TOKEN_TABLE_ALLOWLIST = new Set([
    'runtime/tokens/tokenRegistry.js',
    'ui/bridges/tokenCssBridge.js',
]);

function shouldIgnore(relPath) {
    return shouldIgnoreArchitecturePath(relPath, IGNORE_DIRS);
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

function collectTokenTableViolations(scopes, exclude = []) {
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
            if (TOKEN_TABLE_ALLOWLIST.has(normalized)) continue;

            const content = fs.readFileSync(file.fullPath, 'utf8');
            const signalCount = TOKEN_TABLE_PATTERNS.reduce(
                (count, pattern) => count + (pattern.test(content) ? 1 : 0),
                0,
            );
            if (signalCount >= 3) {
                violations.push(`${file.relPath}: duplicate token table candidate (${signalCount} token groups)`);
            }
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
                    'runtime/capabilities/toolRegistrationRuntime.js',
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
        {
            name: 'token-authority-legacy-imports',
            violations: collectViolations({
                scopes: ['app', 'ui', 'runtime', 'platform', 'workspaces', 'education', 'marketplace', 'review', 'templates'],
                patterns: [TOKEN_IMPORT],
                includeImportsOnly: true,
            }),
        },
        {
            name: 'token-authority-duplicate-tables',
            violations: collectTokenTableViolations(
                ['app', 'ui', 'runtime', 'platform', 'workspaces', 'education', 'marketplace', 'review', 'templates', 'engine', 'core'],
                ['tests'],
            ),
        },
        {
            name: 'token-authority-css-projection',
            violations: collectViolations({
                scopes: ['app', 'ui', 'runtime', 'platform', 'workspaces', 'education', 'marketplace', 'review', 'templates'],
                exclude: ['ui/bridges/tokenCssBridge.js'],
                patterns: [CSS_SET_PROPERTY],
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
