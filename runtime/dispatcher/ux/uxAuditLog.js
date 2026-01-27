let latestAuditLog = null;

export function createUXAuditLog() {
    const entries = [];

    const log = {
        append(entry) {
            entries.push(entry);
        },
        snapshot() {
            return entries.slice();
        },
        clear() {
            entries.length = 0;
        },
    };
    latestAuditLog = log;
    return log;
}

export function getUXAuditLog() {
    return latestAuditLog ? latestAuditLog.snapshot() : [];
}
