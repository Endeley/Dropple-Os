export function createUXAuditLog() {
    const entries = [];

    return {
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
}
