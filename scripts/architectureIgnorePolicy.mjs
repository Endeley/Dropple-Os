const BASE_IGNORE_DIRS = Object.freeze([
    '.git',
    '.next',
    '.next-dev',
    '.next-prod',
    '.next-e2e',
    'node_modules',
    'out',
    'build',
    'dist',
    'coverage',
    'test-results',
    'reports',
    'var',
    'tmp',
]);

function normalizeEntry(entry) {
    return String(entry).replaceAll('\\', '/').replace(/\/+$/g, '');
}

export function getArchitectureIgnoreDirs(extra = []) {
    const merged = [...BASE_IGNORE_DIRS, ...extra]
        .map((entry) => normalizeEntry(entry))
        .filter(Boolean);
    return new Set(merged);
}

export function shouldIgnoreArchitecturePath(relPath, ignoreDirs) {
    const normalized = normalizeEntry(relPath);
    const [rootDir] = normalized.split('/');
    if (rootDir?.startsWith('.next')) {
        return true;
    }
    for (const dir of ignoreDirs) {
        if (normalized === dir || normalized.startsWith(`${dir}/`)) {
            return true;
        }
    }
    return false;
}
