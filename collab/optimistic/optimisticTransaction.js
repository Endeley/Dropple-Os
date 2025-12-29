import { useOptimisticStore } from './optimisticStore.js';

/**
 * Applies an optimistic transaction to the overlay store.
 */
export function startOptimisticTransaction(txId, patch) {
    useOptimisticStore.getState().apply(txId, patch);
}

/**
 * Clears an optimistic transaction.
 */
export function clearOptimisticTransaction(txId) {
    useOptimisticStore.getState().clear(txId);
}
