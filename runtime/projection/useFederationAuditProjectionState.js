import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

export function useFederationAuditProjectionState(selector = (state) => state) {
    const federationAudit = useRuntimeStore((state) => state?.federationAudit ?? { entries: [], hash: '', maxEntries: 256 });
    return useMemo(() => selector(federationAudit), [federationAudit, selector]);
}

