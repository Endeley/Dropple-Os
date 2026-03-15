'use client';

import { useMemo } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import {
    projectRigControllerOverlayNodes,
    projectRigControllerTimelineTracks,
    selectActiveRig,
} from '@/runtime/projection/selectors/rigSelectors.js';
import { useMediaTimelineSelectionStore } from '@/ui/workspace/media/shared/useMediaTimelineSelectionStore.js';

function overlayCardStyle(selected) {
    return {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        borderRadius: 999,
        border: selected
            ? '1px solid rgba(14, 116, 144, 0.55)'
            : '1px solid rgba(148, 163, 184, 0.35)',
        background: selected
            ? 'rgba(14, 116, 144, 0.14)'
            : 'rgba(255, 255, 255, 0.9)',
        color: '#0f172a',
        boxShadow: '0 8px 22px rgba(15, 23, 42, 0.14)',
        padding: '6px 10px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
        cursor: 'pointer',
        pointerEvents: 'auto',
        backdropFilter: 'blur(8px)',
    };
}

export function RigControllerOverlay() {
    const document = useRuntimeStore((state) => state.document);
    const nodes = useRuntimeStore((state) => state.nodes);
    const activeRig = useRuntimeStore(selectActiveRig);
    const selectedTrackId = useMediaTimelineSelectionStore((state) => state.selectedTrackId);
    const selectTrack = useMediaTimelineSelectionStore((state) => state.selectTrack);
    const controllerTracks = useMemo(
        () => projectRigControllerTimelineTracks(activeRig, document?.motion),
        [activeRig, document?.motion]
    );
    const overlayNodes = useMemo(
        () => projectRigControllerOverlayNodes(activeRig, nodes),
        [activeRig, nodes]
    );

    if (!activeRig || !overlayNodes.length) return null;

    return (
        <div
            aria-label='Rig controller overlay'
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1040,
            }}>
            {overlayNodes.map((controller) => {
                const relatedTrack = controllerTracks.find(
                    (track) => track.controllerId === controller.id
                );
                const selected = relatedTrack?.id === selectedTrackId;

                return (
                    <button
                        key={controller.id}
                        type='button'
                        onClick={() => {
                            if (relatedTrack?.id) {
                                selectTrack(relatedTrack.id);
                            }
                        }}
                        style={{
                            ...overlayCardStyle(selected),
                            left: `${controller.x}px`,
                            top: `${controller.y}px`,
                        }}>
                        {controller.label}
                    </button>
                );
            })}
        </div>
    );
}
