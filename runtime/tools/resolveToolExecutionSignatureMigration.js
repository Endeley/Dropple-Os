function normalizeMajor(value) {
    const number = Number.parseInt(String(value), 10);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

const EXECUTION_SIGNATURE_MIGRATION_WINDOWS = Object.freeze({
    'exec-version-major-migrated-shared': Object.freeze({
        fromMajor: 1,
        toMajor: 2,
    }),
});

export function getExecutionSignatureMigrationWindow(toolId) {
    if (typeof toolId !== 'string' || toolId.trim().length === 0) return null;
    return EXECUTION_SIGNATURE_MIGRATION_WINDOWS[toolId.trim()] ?? null;
}

export function allowsExecutionSignatureMajorMigration({ toolId, majorVersions, coreKeyCount } = {}) {
    const window = getExecutionSignatureMigrationWindow(toolId);
    if (!window) return false;
    if (!Array.isArray(majorVersions) || majorVersions.length !== 2) return false;
    if (coreKeyCount !== 1) return false;

    const normalized = majorVersions.map(normalizeMajor).filter((value) => value !== null).sort((a, b) => a - b);
    if (normalized.length !== 2) return false;

    return normalized[0] === window.fromMajor && normalized[1] === window.toMajor;
}

export { EXECUTION_SIGNATURE_MIGRATION_WINDOWS };
