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

const SCANNER_EXTRA_DIRS = Object.freeze({
    architectureDrift: Object.freeze(['reports']),
    dispatcherOwnershipTest: Object.freeze(['convex/_generated']),
    templateAuthorityTest: Object.freeze(['docs']),
});

const SCANNER_IGNORE_FILES = Object.freeze({
    dispatcherOwnershipTest: Object.freeze(['tests/architecture/dispatcherOwnership.test.ts']),
});

function normalizeEntry(entry) {
    return String(entry).replaceAll('\\', '/').replace(/\/+$/g, '');
}

export function getArchitectureIgnoreDirs(extra = []) {
    const merged = [...BASE_IGNORE_DIRS, ...extra]
        .map((entry) => normalizeEntry(entry))
        .filter(Boolean);
    return new Set(merged);
}

export function getArchitectureIgnoreFiles(extra = [], scannerId = '') {
    const scoped = SCANNER_IGNORE_FILES[scannerId] ?? [];
    const merged = [...scoped, ...(Array.isArray(extra) ? extra : [])]
        .map((entry) => normalizeEntry(entry))
        .filter(Boolean);
    return new Set(merged);
}

export function getArchitectureScannerPolicy({
    scannerId = '',
    extraDirs = [],
    extraFiles = [],
} = {}) {
    const scopedDirs = SCANNER_EXTRA_DIRS[scannerId] ?? [];
    return Object.freeze({
        ignoreDirs: getArchitectureIgnoreDirs([...scopedDirs, ...(Array.isArray(extraDirs) ? extraDirs : [])]),
        ignoreFiles: getArchitectureIgnoreFiles(extraFiles, scannerId),
    });
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

export function shouldIgnoreArchitectureFile(relPath, ignoreFiles) {
    const normalized = normalizeEntry(relPath);
    return !!ignoreFiles?.has(normalized);
}
