import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

/**
 * Public, sanitized UX audit snapshot.
 * UI must ONLY access UX audit data through projection.
 */
export function getUXAuditSnapshot() {
    const log = useRuntimeStore.getState()?.uxAudit ?? [];
    if (!log) return [];

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
