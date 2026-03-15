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

export async function startCollaborationSession(session, { dispatcher } = {}) {
    if (!session?.id) {
        throw new Error('Session must have id');
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.COLLABORATION_SESSION_START,
        payload: {
            session: {
                id: session.id,
                startedAt: session.startedAt ?? Date.now(),
                metadata: session.metadata ?? {},
            },
        },
    });
}

export async function endCollaborationSession({ dispatcher } = {}) {
    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.COLLABORATION_SESSION_END,
        payload: {},
    });
}

export function getCollaborationSession(options = {}) {
    return resolveState(options)?.collaboration?.session ?? null;
}

export async function addSessionUser(user, { dispatcher } = {}) {
    if (!user?.id) {
        throw new Error('Session user must have id');
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.COLLABORATION_SESSION_USER_JOIN,
        payload: {
            user: {
                ...user,
                joinedAt: user.joinedAt ?? Date.now(),
            },
        },
    });
}

export async function removeSessionUser(userId, { dispatcher } = {}) {
    if (!userId) {
        return null;
    }

    const activeDispatcher = dispatcher || getRuntimeDispatcher();

    return activeDispatcher.dispatch({
        type: EventTypes.COLLABORATION_SESSION_USER_LEAVE,
        payload: {
            userId,
        },
    });
}
