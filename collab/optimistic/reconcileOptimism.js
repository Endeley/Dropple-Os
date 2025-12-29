import { clearOptimisticTransaction, startOptimisticTransaction } from './optimisticTransaction.js';

/**
 * Reconciles optimistic overlay with authoritative state.
 * - If tx kept: leave overlay (or rebuild) as needed.
 * - If tx rejected: remove overlay.
 * - If tx confirmed: clear overlay.
 */
export function reconcileOptimism({ txId, accepted, nodesPatch }) {
  if (accepted) {
    // optimistic patch already reflected in engine
    clearOptimisticTransaction(txId);
  } else {
    // rollback
    clearOptimisticTransaction(txId);
  }
}
