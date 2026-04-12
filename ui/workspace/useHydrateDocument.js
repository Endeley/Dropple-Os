import { replayBranch } from '@/runtime/replay/replayBranch.js';

/**
 * Runtime orchestration hook.
 *
 * Responsible for:
 * - Resetting runtime
 * - Deterministic replay
 * - Hydration
 */
export function useHydrateDocument(dispatcher) {
    function hydrateFromSnapshot(snapshot) {
        if (!snapshot) return;
        if (!dispatcher) {
            console.warn('[useHydrateDocument] Dispatcher not provided; skipping hydration.');
            return;
        }

        const { doc, branches, events, timelines, markers } = snapshot;

        // 1️⃣ Build branch map
        const branchMap = {};
        for (const b of branches) {
            branchMap[b.branchId] = {
                base: b.base ?? null,
                events: [],
                head: null,
                checkpoints: [],
            };
        }

        // 2️⃣ Attach ordered events
        events
            .slice()
            .sort((a, b) => a.createdAt - b.createdAt)
            .forEach((e) => {
                const branch = branchMap[e.branchId];
                if (!branch) return;

                branch.events.push({
                    id: e.eventId,
                    type: e.type,
                    payload: e.payload,
                    createdAt: e.createdAt,
                });

                branch.head = e.eventId;
            });

        const document = {
            id: doc.docId,
            branches: branchMap,
            currentBranch: doc.currentBranch,
        };

        // 3️⃣ Reset runtime completely
        dispatcher.reset();

        // 4️⃣ Replay active branch deterministically
        const activeBranch = document.branches[document.currentBranch];
        const nextState = replayBranch(activeBranch, undefined, { dispatcher });

        // 5️⃣ Hydrate runtime
        const hydrated = {
            ...nextState,
            document,
            timeline: timelines?.[0]?.data ?? null,
            markers: markers ?? [],
        };

        dispatcher.hydrateRuntimeState(hydrated, { animate: false });
    }

    return hydrateFromSnapshot;
}
