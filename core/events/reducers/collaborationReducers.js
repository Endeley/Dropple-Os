import { EventTypes } from '../eventTypes.js';
import {
  createFederatedSessionEnvelope,
  createFederatedSessionCheckpoint,
  transitionFederatedSession,
} from '@/core/collaboration/sessionFederationEnvelope.js';

const EMPTY_COLLABORATION = Object.freeze({
  session: null,
  presence: Object.freeze({}),
  cursors: Object.freeze({}),
  federation: Object.freeze({
    sessions: Object.freeze({}),
  }),
});

function getCollaborationState(state) {
  return state?.collaboration ?? EMPTY_COLLABORATION;
}

export function collaborationReducers(state, event) {
  const collaboration = getCollaborationState(state);
  const federation = collaboration.federation ?? { sessions: {} };

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

    case EventTypes.COLLABORATION_FEDERATION_SESSION_BEGIN: {
      const sessionId = event.payload?.sessionId;
      if (typeof sessionId !== 'string' || !sessionId.trim()) return state;
      const existing = federation.sessions?.[sessionId] ?? null;
      if (existing) return state;
      const envelope = createFederatedSessionEnvelope({
        sessionId,
        sessionType: event.payload?.sessionType ?? 'create',
        participants: event.payload?.participants ?? [],
        phase: 'created',
        commitEpoch: 0,
        authority: event.payload?.authority ?? null,
      });
      const snapshot = {
        envelope,
        checkpoint: createFederatedSessionCheckpoint(envelope),
        previewBounds: null,
      };
      return {
        ...state,
        collaboration: {
          ...collaboration,
          federation: {
            sessions: {
              ...(federation.sessions ?? {}),
              [sessionId]: snapshot,
            },
          },
        },
      };
    }

    case EventTypes.COLLABORATION_FEDERATION_SESSION_PREVIEW: {
      const sessionId = event.payload?.sessionId;
      const session = federation.sessions?.[sessionId] ?? null;
      if (!session) return state;
      if (session.envelope?.phase === 'closed') return state;
      const bounds = event.payload?.bounds ?? null;
      const nextEnvelope = transitionFederatedSession(session.envelope, {
        type: 'set-preview',
        expectedCheckpointSignature: event.payload?.expectedCheckpointSignature ?? null,
      });
      const snapshot = {
        envelope: nextEnvelope,
        checkpoint: createFederatedSessionCheckpoint(nextEnvelope),
        previewBounds: bounds,
      };
      return {
        ...state,
        collaboration: {
          ...collaboration,
          federation: {
            sessions: {
              ...(federation.sessions ?? {}),
              [sessionId]: snapshot,
            },
          },
        },
      };
    }

    case EventTypes.COLLABORATION_FEDERATION_SESSION_COMMIT: {
      const sessionId = event.payload?.sessionId;
      const session = federation.sessions?.[sessionId] ?? null;
      if (!session) return state;
      const envelope = transitionFederatedSession(session.envelope, {
        type: 'seal-commit',
        expectedCheckpointSignature: event.payload?.expectedCheckpointSignature ?? null,
      });
      const snapshot = {
        envelope,
        checkpoint: createFederatedSessionCheckpoint(envelope),
        previewBounds: session.previewBounds ?? null,
      };
      return {
        ...state,
        collaboration: {
          ...collaboration,
          federation: {
            sessions: {
              ...(federation.sessions ?? {}),
              [sessionId]: snapshot,
            },
          },
        },
      };
    }

    case EventTypes.COLLABORATION_FEDERATION_SESSION_CLOSE: {
      const sessionId = event.payload?.sessionId;
      const session = federation.sessions?.[sessionId] ?? null;
      if (!session) return state;
      const envelope = transitionFederatedSession(session.envelope, {
        type: 'close-session',
        expectedCheckpointSignature: event.payload?.expectedCheckpointSignature ?? null,
      });
      const nextSessions = { ...(federation.sessions ?? {}) };
      delete nextSessions[sessionId];
      return {
        ...state,
        collaboration: {
          ...collaboration,
          federation: {
            sessions: nextSessions,
          },
        },
      };
    }

    default:
      return state;
  }
}
