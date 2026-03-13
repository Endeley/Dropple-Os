import { EventTypes } from '../eventTypes.js';

const EMPTY_COLLABORATION = Object.freeze({
  session: null,
  presence: Object.freeze({}),
  cursors: Object.freeze({}),
});

function getCollaborationState(state) {
  return state?.collaboration ?? EMPTY_COLLABORATION;
}

export function collaborationReducers(state, event) {
  const collaboration = getCollaborationState(state);

  switch (event.type) {
    case EventTypes.COLLABORATION_SESSION_START: {
      const session = event.payload?.session;
      if (!session?.id) {
        return state;
      }

      return {
        ...state,
        collaboration: {
          session: {
            id: session.id,
            startedAt: session.startedAt ?? null,
            metadata: session.metadata ?? {},
            users: {},
          },
          presence: {},
          cursors: {},
        },
      };
    }

    case EventTypes.COLLABORATION_SESSION_END:
      return {
        ...state,
        collaboration: {
          session: null,
          presence: {},
          cursors: {},
        },
      };

    case EventTypes.COLLABORATION_SESSION_USER_JOIN: {
      const session = collaboration.session;
      const user = event.payload?.user;
      if (!session || !user?.id) {
        return state;
      }

      return {
        ...state,
        collaboration: {
          ...collaboration,
          session: {
            ...session,
            users: {
              ...(session.users || {}),
              [user.id]: {
                ...user,
              },
            },
          },
        },
      };
    }

    case EventTypes.COLLABORATION_SESSION_USER_LEAVE: {
      const session = collaboration.session;
      const userId = event.payload?.userId;
      if (!session || !userId || !session.users?.[userId]) {
        return state;
      }

      const nextUsers = { ...(session.users || {}) };
      delete nextUsers[userId];

      return {
        ...state,
        collaboration: {
          ...collaboration,
          session: {
            ...session,
            users: nextUsers,
          },
        },
      };
    }

    case EventTypes.COLLABORATION_PRESENCE_UPDATE: {
      const user = event.payload?.user;
      if (!user?.id) {
        return state;
      }

      return {
        ...state,
        collaboration: {
          ...collaboration,
          presence: {
            ...(collaboration.presence || {}),
            [user.id]: {
              ...user,
            },
          },
        },
      };
    }

    case EventTypes.COLLABORATION_PRESENCE_REMOVE: {
      const userId = event.payload?.userId;
      if (!userId || !collaboration.presence?.[userId]) {
        return state;
      }

      const nextPresence = { ...(collaboration.presence || {}) };
      delete nextPresence[userId];

      return {
        ...state,
        collaboration: {
          ...collaboration,
          presence: nextPresence,
        },
      };
    }

    case EventTypes.COLLABORATION_CURSOR_UPDATE: {
      const userId = event.payload?.userId;
      const position = event.payload?.position;
      if (
        !userId ||
        typeof position?.x !== 'number' ||
        typeof position?.y !== 'number'
      ) {
        return state;
      }

      return {
        ...state,
        collaboration: {
          ...collaboration,
          cursors: {
            ...(collaboration.cursors || {}),
            [userId]: {
              x: position.x,
              y: position.y,
              updatedAt: position.updatedAt ?? null,
            },
          },
        },
      };
    }

    case EventTypes.COLLABORATION_CURSOR_REMOVE: {
      const userId = event.payload?.userId;
      if (!userId || !collaboration.cursors?.[userId]) {
        return state;
      }

      const nextCursors = { ...(collaboration.cursors || {}) };
      delete nextCursors[userId];

      return {
        ...state,
        collaboration: {
          ...collaboration,
          cursors: nextCursors,
        },
      };
    }

    default:
      return state;
  }
}
