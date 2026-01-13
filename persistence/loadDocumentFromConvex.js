// persistence/loadDocumentFromConvex.js

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { replayBranch } from '@/persistence/replay';
import { resetRuntimeState, setRuntimeState, setIsReplaying } from '@/runtime/state/runtimeState';
import { syncRuntimeToZustand } from '@/runtime/bridge/zustandBridge';

/**
 * Load and hydrate a document from Convex.
 *
 * 🔒 Rules:
 * - Deterministic replay only
 * - Runtime is rebuilt from events
 * - No silent fixes
 */
export function useLoadDocumentFromConvex(docId) {
    const snapshot = useQuery(api.loadDocumentSnapshot, { docId });

    if (snapshot === undefined) {
        return { status: 'loading' };
    }

    if (!snapshot) {
        return { status: 'not_found' };
    }

    const { doc, branches, events, timelines, markers } = snapshot;

    function hydrate() {
        // 1️⃣ Rebuild document structure
        const branchMap = {};
        for (const b of branches) {
            branchMap[b.branchId] = {
                base: b.base ?? null,
                events: [],
                head: null,
                checkpoints: [],
            };
        }

        // 2️⃣ Attach events to branches (ordered by creation)
        events.sort((a, b) => a.createdAt - b.createdAt).forEach((e) => {
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
        resetRuntimeState();

        // 4️⃣ Replay active branch
        const activeBranch = document.branches[document.currentBranch];

        setIsReplaying(true);
        let nextState;
        try {
            nextState = replayBranch(activeBranch, undefined);
        } finally {
            setIsReplaying(false);
        }

        // 5️⃣ Hydrate runtime with document + extras
        const hydrated = {
            ...nextState,
            document,
            timeline: timelines?.[0]?.data ?? null,
            markers: markers ?? [],
        };

        setRuntimeState(hydrated);
        syncRuntimeToZustand(hydrated);
    }

    return {
        status: 'ready',
        hydrate,
        meta: {
            branchCount: branches.length,
            eventCount: events.length,
        },
    };
}
