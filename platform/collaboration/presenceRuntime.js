import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeDispatcher } from '@/runtime/dispatcher/dispatcherHandle.js';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

function resolveState({ runtimeState, dispatcher } = {}) {
    if (runtimeState) return runtimeState;
    if (dispatcher?.getState) return dispatcher.getState();
    try {
        return getRuntimeDispatcher().getState();
    } catch {
        return getRuntimeState();
    }
}

export async function updatePresence(user, { dispatcher } = {}) {
    if (!user?.id) {
        throw new Error('Presence user must have id');
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.COLLABORATION_PRESENCE_UPDATE,
        payload: {
            user: {
                ...user,
                lastSeen: user.lastSeen ?? Date.now(),
            },
        },
    });
}

export async function removePresence(userId, { dispatcher } = {}) {
    if (!userId) {
        return null;
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.COLLABORATION_PRESENCE_REMOVE,
        payload: {
            userId,
        },
    });
}

export function getPresence(options = {}) {
    const presence = resolveState(options)?.collaboration?.presence ?? {};
    return Object.values(presence).sort((a, b) => String(a?.id ?? '').localeCompare(String(b?.id ?? '')));
}
