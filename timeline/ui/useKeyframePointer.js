// timeline/ui/useKeyframePointer.js

import { useRef, useCallback } from 'react';
import { useTimelineSelectionStore } from './useTimelineSelectionStore';

/**
 * Pointer handling for timeline keyframes (multi-select aware).
 *
 * 🔒 Rules:
 * - UI-only
 * - No dispatch
 * - Prepares group drag intent only
 */
export function useKeyframePointer() {
    const { selectSingle, toggleKeyframe, selectedKeyframeIds } = useTimelineSelectionStore((s) => ({
        selectSingle: s.selectSingle,
        toggleKeyframe: s.toggleKeyframe,
        selectedKeyframeIds: s.selectedKeyframeIds,
    }));

    const dragRef = useRef(null);

    const onPointerDown = useCallback(
        (event, keyframe) => {
            event.stopPropagation();
            event.preventDefault();

            const { id, time } = keyframe;
            if (!id) return;

            if (event.shiftKey) {
                toggleKeyframe(id);
            } else {
                selectSingle(id);
            }

            dragRef.current = {
                primaryId: id,
                startTime: time,
                startX: event.clientX,
                pointerId: event.pointerId,
                keyframeIds: new Set(selectedKeyframeIds.has(id) ? selectedKeyframeIds : [id]),
            };

            try {
                event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
                // ignore
            }
        },
        [selectSingle, toggleKeyframe, selectedKeyframeIds]
    );

    const onPointerUp = useCallback((event) => {
        const drag = dragRef.current;
        if (!drag) return;

        try {
            event.currentTarget.releasePointerCapture(drag.pointerId);
        } catch {
            // ignore
        }

        dragRef.current = null;
    }, []);

    const getDragState = () => dragRef.current;

    return {
        onPointerDown,
        onPointerUp,
        getDragState,
    };
}
