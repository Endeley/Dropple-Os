import { getRuntimeState } from '../state/runtimeState.js';

const STRUCTURAL_RIG_EVENTS = new Set([
    'rig/create',
    'rig/update',
    'rig/delete',
    'rig/set-active',
    'rig/controller/create',
    'rig/controller/update',
    'rig/controller/delete',
    'rig/constraint/create',
    'rig/constraint/update',
    'rig/constraint/delete',
]);

const STRUCTURAL_SEQUENCE_EVENTS = new Set([
    'sequence/create',
    'sequence/update',
    'sequence/delete',
    'sequence/set-active',
    'sequence/track/create',
    'sequence/track/update',
    'sequence/track/delete',
    'sequence/clip/create',
    'sequence/clip/update',
    'sequence/clip/delete',
]);

const STRUCTURAL_STATE_MACHINE_EVENTS = new Set([
    'state-machine/create',
    'state-machine/update',
    'state-machine/delete',
    'state-machine/set-active',
    'state-machine/parameter/set',
]);

/**
 * Returns null to block, or the event to allow.
 */
export function applyTimelineGuard(event) {
    if (
        STRUCTURAL_RIG_EVENTS.has(event?.type) ||
        STRUCTURAL_SEQUENCE_EVENTS.has(event?.type) ||
        STRUCTURAL_STATE_MACHINE_EVENTS.has(event?.type)
    ) {
        return event;
    }

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
