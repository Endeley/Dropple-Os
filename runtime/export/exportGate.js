export function evaluateExportGate(issues = [], options = {}) {
    const list = Array.isArray(issues) ? issues : [];
    const strict = options?.strict === true;
    const errors = list.filter((issue) => issue?.severity === 'error');
    const warnings = list.filter((issue) => issue?.severity === 'warning');
    const infos = list.filter((issue) => issue?.severity === 'info');

    const status =
        errors.length > 0
            ? 'block'
            : warnings.length > 0
              ? strict
                  ? 'block'
                  : 'warn'
              : 'allow';

    if (process.env.NODE_ENV === 'development' && strict && warnings.length > 0) {
        console.warn('[ExportGate] Strict mode: warnings escalated to blocking');
    }

    const result = {
        status,
        blockingIssues: strict ? [...errors, ...warnings] : errors,
        warnings: strict ? [] : warnings,
        summary: {
            errorCount: errors.length,
            warningCount: warnings.length,
            infoCount: infos.length,
        },
    };

    if (process.env.NODE_ENV === 'development') {
        Object.freeze(result.summary);
        Object.freeze(result);
    }

    return result;
}
