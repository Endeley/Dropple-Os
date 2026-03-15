'use client';

import { create } from 'zustand';

export const useMediaTimelineSelectionStore = create((set) => ({
    selectedTrackId: null,
    selectedKeyframeId: null,
    selectedKeyframeIds: [],
    selectedSequenceClipId: null,

    selectTrack(trackId) {
        set((state) => ({
            selectedTrackId: trackId,
            selectedKeyframeId:
                state.selectedTrackId === trackId ? state.selectedKeyframeId : null,
            selectedKeyframeIds:
                state.selectedTrackId === trackId && state.selectedKeyframeId
                    ? [state.selectedKeyframeId]
                    : [],
            selectedSequenceClipId:
                state.selectedTrackId === trackId ? state.selectedSequenceClipId : null,
        }));
    },

    selectKeyframe({ trackId, keyframeId, additive = false, toggle = false }) {
        set((state) => {
            const nextTrackId = trackId ?? null;
            const currentIds =
                additive && state.selectedTrackId === nextTrackId ? state.selectedKeyframeIds : [];
            let nextIds = currentIds;

            if (!keyframeId) {
                nextIds = [];
            } else if (toggle && currentIds.includes(keyframeId)) {
                nextIds = currentIds.filter((entry) => entry !== keyframeId);
            } else if (additive) {
                nextIds = Array.from(new Set([...currentIds, keyframeId]));
            } else {
                nextIds = [keyframeId];
            }

            return {
                selectedTrackId: nextTrackId,
                selectedKeyframeId: nextIds.length ? nextIds[nextIds.length - 1] : null,
                selectedKeyframeIds: nextIds,
                selectedSequenceClipId: null,
            };
        });
    },

    selectSequenceClip({ trackId, clipId }) {
        set({
            selectedTrackId: trackId ?? null,
            selectedKeyframeId: null,
            selectedKeyframeIds: [],
            selectedSequenceClipId: clipId ?? null,
        });
    },

    clearSelection() {
        set({
            selectedTrackId: null,
            selectedKeyframeId: null,
            selectedKeyframeIds: [],
            selectedSequenceClipId: null,
        });
    },
}));
