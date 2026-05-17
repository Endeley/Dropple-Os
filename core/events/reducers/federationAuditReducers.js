import { EventTypes } from '../eventTypes.js';
import {
    appendFederationAuditEntry,
    createInitialFederationAuditState,
} from '@/core/collaboration/federationAuditState.js';

export function federationAuditReducers(state, event) {
    if (event?.type !== EventTypes.FEDERATION_AUDIT_APPEND) return state;
    return {
        ...state,
        federationAudit: appendFederationAuditEntry(
            state?.federationAudit,
            event?.payload?.entry ?? null,
            event?.payload?.maxEntries,
        ),
    };
}

export { createInitialFederationAuditState };

