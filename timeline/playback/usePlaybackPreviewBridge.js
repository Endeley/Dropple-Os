// timeline/playback/usePlaybackPreviewBridge.js

import { useCallback } from 'react';

/**
 * Bridges playback time into timeline preview.
 *
 * 🔒 Rules:
 * - Preview-only
 * - No dispatch
 * - No reducer access
 * - Safe to stop/start anytime
 */
export function usePlaybackPreviewBridge({ previewAtTime }) {
    if (typeof previewAtTime !== 'function') {
        throw new Error('usePlaybackPreviewBridge: previewAtTime callback is required');
    }

    /**
     * Called by playback controller on each tick.
     */
    const onPlaybackTimeUpdate = useCallback(
        (time) => {
            previewAtTime(time);
        },
        [previewAtTime]
    );

    return {
        onPlaybackTimeUpdate,
    };
}
