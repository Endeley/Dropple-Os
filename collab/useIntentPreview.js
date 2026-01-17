// collab/useIntentPreview.js

import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { canvasBus } from '@/ui/canvasBus';

/**
 * N2 INTENT SHARING
 *
 * Intent previews are advisory only.
 * They must never:
 * - block edits
 * - trigger warnings
 * - imply ownership
 */
export function useIntentPreview({ docId, enabled = true, selfUserId = null }) {
    const updateIntent = useMutation(api.updateIntent);
    const presence = useQuery(api.getPresence, docId ? { docId } : 'skip') ?? [];
    const lastIntentRef = useRef(null);

    // Broadcast local preview intents
    useEffect(() => {
        if (!docId || !enabled) return;

        const toIntent = (preview) => {
            if (!preview) return null;

            if (preview.type === 'move-preview') {
                return {
                    type: 'move',
                    nodeIds: preview.nodeIds || [],
                    delta: preview.delta ?? { x: 0, y: 0 },
                };
            }

            if (preview.type === 'resize-preview') {
                return {
                    type: 'resize',
                    nodeIds: preview.nodeIds || [],
                    resize: preview.resize ?? { width: 0, height: 0 },
                    delta: preview.delta ?? { x: 0, y: 0 },
                };
            }

            return null;
        };

        const onPreview = ({ preview }) => {
            const intent = toIntent(preview);
            const serialized = JSON.stringify(intent ?? null);
            if (serialized === lastIntentRef.current) return;
            lastIntentRef.current = serialized;

            updateIntent({ docId, intent });
        };

        // Clearing intent ends courtesy visuals only.
        // No document state is affected.
        const onCommitOrCancel = () => {
            lastIntentRef.current = null;
            updateIntent({ docId, intent: null });
        };

        canvasBus.on('session.update', onPreview);
        canvasBus.on('session.commit', onCommitOrCancel);
        canvasBus.on('session.cancel', onCommitOrCancel);

        return () => {
            canvasBus.off('session.update', onPreview);
            canvasBus.off('session.commit', onCommitOrCancel);
            canvasBus.off('session.cancel', onCommitOrCancel);
        };
    }, [docId, enabled, updateIntent]);

    // Return remote intents only
    return presence.filter(
        (p) =>
            p.intent &&
            Array.isArray(p.intent.nodeIds) &&
            (!selfUserId || p.userId !== selfUserId)
    );
}
