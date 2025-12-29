import { create } from 'zustand';

/**
 * UI-only optimistic overlay.
 */
export const useOptimisticStore = create(() => ({
  pending: {}, // txId → optimistic patch
  apply(txId, patch) {
    this.pending[txId] = patch;
  },
  clear(txId) {
    delete this.pending[txId];
  },
  reset() {
    this.pending = {};
  },
}));
