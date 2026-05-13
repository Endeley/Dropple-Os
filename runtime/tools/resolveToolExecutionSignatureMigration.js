function normalizeMajor(value) {
    const number = Number.parseInt(String(value), 10);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

function normalizeTimestamp(value) {
    if (typeof value !== 'string' || value.trim().length === 0) return null;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

export function validateExecutionSignatureMigrationWindows(rawWindows) {
    if (!rawWindows || typeof rawWindows !== 'object') {
        throw new Error('execution-signature migration windows must be an object map');
    }

    const entries = Object.entries(rawWindows);
    if (entries.length === 0) {
        throw new Error('execution-signature migration windows must define at least one window');
    }

    for (const [toolId, window] of entries) {
        if (typeof toolId !== 'string' || toolId.trim().length === 0) {
            throw new Error('execution-signature migration window keys must be non-empty tool ids');
        }

        if (!window || typeof window !== 'object') {
            throw new Error(`execution-signature migration window for "${toolId}" must be an object`);
        }

        if (!isNonNegativeInteger(window.fromMajor) || !isNonNegativeInteger(window.toMajor)) {
            throw new Error(`execution-signature migration window for "${toolId}" must define non-negative integer fromMajor/toMajor`);
        }

        if (window.fromMajor >= window.toMajor) {
            throw new Error(`execution-signature migration window for "${toolId}" must define fromMajor < toMajor`);
        }

        if (typeof window.sunsetAt !== 'string' || window.sunsetAt.trim().length === 0 || !Number.isFinite(normalizeTimestamp(window.sunsetAt))) {
            throw new Error(`execution-signature migration window for "${toolId}" must define a valid ISO sunsetAt timestamp`);
        }

        if (typeof window.ticket !== 'string' || window.ticket.trim().length === 0) {
            throw new Error(`execution-signature migration window for "${toolId}" must define a non-empty ticket`);
        }
    }

    return Object.freeze(
        Object.fromEntries(
            entries.map(([toolId, window]) => [
                toolId.trim(),
                Object.freeze({
                    fromMajor: window.fromMajor,
                    toMajor: window.toMajor,
                    sunsetAt: window.sunsetAt.trim(),
                    ticket: window.ticket.trim(),
                }),
            ]),
        ),
    );
}

const EXECUTION_SIGNATURE_MIGRATION_WINDOWS = validateExecutionSignatureMigrationWindows({
    'exec-version-major-migrated-shared': Object.freeze({
        fromMajor: 1,
        toMajor: 2,
        sunsetAt: '2026-09-01T00:00:00.000Z',
        ticket: 'ARCH-421',
    }),
});

export function getExecutionSignatureMigrationWindow(toolId) {
    if (typeof toolId !== 'string' || toolId.trim().length === 0) return null;
    return EXECUTION_SIGNATURE_MIGRATION_WINDOWS[toolId.trim()] ?? null;
}

export function allowsExecutionSignatureMajorMigration({ toolId, majorVersions, coreKeyCount, currentTimeMs } = {}) {
    const window = getExecutionSignatureMigrationWindow(toolId);
    if (!window) return false;
    if (!Array.isArray(majorVersions) || majorVersions.length !== 2) return false;
    if (coreKeyCount !== 1) return false;
    if (!Number.isFinite(currentTimeMs)) return false;

    const sunsetMs = normalizeTimestamp(window.sunsetAt);
    if (!Number.isFinite(sunsetMs)) return false;
    if (currentTimeMs >= sunsetMs) return false;

    const normalized = majorVersions.map(normalizeMajor).filter((value) => value !== null).sort((a, b) => a - b);
    if (normalized.length !== 2) return false;

    return normalized[0] === window.fromMajor && normalized[1] === window.toMajor;
}

export { EXECUTION_SIGNATURE_MIGRATION_WINDOWS };
