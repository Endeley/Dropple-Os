import { create } from 'zustand';

/**
 * UI-only presence state.
 * NEVER feeds reducers.
 */
export const usePresenceStore = create(() => ({
  users: {}, // userId → { name, color }
  cursors: {}, // userId → { x, y }
  selections: {}, // userId → [nodeIds]

  updateCursor(userId, point) {
    this.cursors[userId] = point;
  },

  updateSelection(userId, nodeIds) {
    this.selections[userId] = nodeIds;
  },

  join(user) {
    this.users[user.id] = user;
  },

  leave(userId) {
    delete this.users[userId];
    delete this.cursors[userId];
    delete this.selections[userId];
  },
}));
