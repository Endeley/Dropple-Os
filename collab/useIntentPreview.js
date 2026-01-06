// collab/useIntentPreview.js

import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { canvasBus } from '@/ui/canvasBus';

/**
 * Intent preview hook.
 *
 * 🔒 No commits
 * 🔒 Canvas-only
 */
export function useIntentPreview({ docId, userId }) {
    const updateIntent = useMutation(api.updateIntent);
    const presence = useQuery(api.getPresence, { docId }) ?? [];
    const lastIntentRef = useRef(null);

    // Broadcast local preview intents
    useEffect(() => {
        if (!docId || !userId) return;

        const onPreview = ({ preview }) => {
            const serialized = JSON.stringify(preview ?? null);
            if (serialized === lastIntentRef.current) return;
            lastIntentRef.current = serialized;

            updateIntent({
                docId,
                userId,
                intent: preview ?? null,
            });
        };

        const onCommitOrCancel = () => {
            updateIntent({
                docId,
                userId,
                intent: null,
            });
        };

        canvasBus.on('session.preview', onPreview);
        canvasBus.on('session.commit', onCommitOrCancel);
        canvasBus.on('session.cancel', onCommitOrCancel);

        return () => {
            canvasBus.off('session.preview', onPreview);
            canvasBus.off('session.commit', onCommitOrCancel);
            canvasBus.off('session.cancel', onCommitOrCancel);
        };
    }, [docId, userId, updateIntent]);

    // Return remote intents only
    return presence.filter((p) => p.userId !== userId && p.intent && Array.isArray(p.intent.nodeIds));
}
