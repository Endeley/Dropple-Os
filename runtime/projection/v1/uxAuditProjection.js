import { getUXAuditLog as __getUXAuditLogInternal } from '../../dispatcher/ux/uxAuditLog.js';

/**
 * Public, sanitized UX audit snapshot.
 * UI must ONLY access UX audit data through projection.
 */
export function getUXAuditSnapshot() {
    const log = __getUXAuditLogInternal?.();
    if (!log) return [];

    // Defensive clone + shape stabilization
    return Array.isArray(log)
        ? log.map((entry) => ({
              id: entry.id,
              type: entry.type,
              timestamp: entry.timestamp,
              message: entry.message,
              level: entry.level,
          }))
        : [];
}
