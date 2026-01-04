import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { getActiveWorkspace } from '../state/workspaceState.js';

/**
 * Returns null to block, or the event to allow.
 */
export function applyTimelineGuard(event) {
    const workspaceId = getActiveWorkspace();
    const policy = resolveWorkspacePolicy(workspaceId);

    if (!policy || !policy.timeline) return event;

    const { mode } = policy.timeline || {};

    // Timeline REQUIRED but event has no time context
    if (mode === 'required') {
        const hasTime =
            event?.meta?.time != null ||
            event?.payload?.time != null ||
            event?.payload?.frame != null;

        if (!hasTime) {
            console.warn(
                `[TimelineGuard] Blocked event without time in workspace "${workspaceId}"`,
                event?.type
            );
            return null;
        }
    }

    return event;
}
