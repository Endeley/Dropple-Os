// branching/ui/useBranchState.js

import { getRuntimeState } from '@/runtime/state/runtimeState';

/**
 * Read-only branch state bridge for UI components.
 *
 * 🔒 Rules:
 * - READ ONLY
 * - No dispatch
 * - No mutation
 * - No persistence writes
 *
 * This hook exists purely to surface branch information to UI.
 */
export function useBranchState() {
    const state = getRuntimeState();
    const doc = state?.document;

    if (!doc) {
        return {
            currentBranch: null,
            branches: [],
        };
    }

    const branches = Object.entries(doc.branches).map(([id, branch]) => ({
        id,
        base: branch.base,
        head: branch.head,
        eventCount: branch.events?.length ?? 0,
    }));

    return {
        currentBranch: doc.currentBranch,
        branches,
    };
}
