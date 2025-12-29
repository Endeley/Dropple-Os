import { canUserPerform } from './permissionPolicy.js';

/**
 * Applies permission and lock policy before dispatching an event.
 */
export function applyPolicy({ user, event, state, lockManager }) {
    const nodeId = event.payload?.id;

    if (nodeId && lockManager?.isLocked(nodeId, user.id)) {
        return null; // blocked by lock
    }

    if (!canUserPerform({ user, event, state })) {
        return null; // blocked by permission
    }

    return event;
}
