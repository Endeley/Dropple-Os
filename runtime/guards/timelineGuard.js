import { getRuntimeState } from '../state/runtimeState.js';

/**
 * Returns null to block, or the event to allow.
 */
export function applyTimelineGuard(event) {
    const runtimeState = getRuntimeState();
    const workspaceId = runtimeState?.workspace?.id ?? 'graphic';
    const workspacePolicy = runtimeState?.workspace?.policy ?? null;
    const timelinePolicy = runtimeState?.workspace?.timeline ?? workspacePolicy?.timeline ?? null;

    if (!timelinePolicy) return event;

    const { mode } = timelinePolicy || {};

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
