'use client';

import { useMemo } from 'react';
import {
    projectRigControllerTimelineTracks,
    projectRigControllerOverlayNodes,
    useWorkspaceProjectionState as useRuntimeStore,
} from '@/runtime/projection';
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
    const scene = useRuntimeStore((state) => state.scene);
    const selectedTrackId = useMediaTimelineSelectionStore((state) => state.selectedTrackId);
    const selectTrack = useMediaTimelineSelectionStore((state) => state.selectTrack);
    const controllerTracks = useMemo(
        () =>
            projectRigControllerTimelineTracks({
                document,
            }).flatMap((rigGroup) =>
                (rigGroup?.tracks || []).map((controllerGroup) => ({
                    controllerId: controllerGroup?.controllerId ?? null,
                    trackId: controllerGroup?.tracks?.[0]?.id ?? null,
                }))
            ),
        [document]
    );
    const overlayNodes = useMemo(
        () =>
            projectRigControllerOverlayNodes({
                document,
                runtime: {
                    scene,
                },
            }),
        [document, scene]
    );

    if (!overlayNodes.length) return null;

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
                    (track) => track.controllerId === controller.controllerId
                );
                const selected = relatedTrack?.trackId === selectedTrackId;

                return (
                    <button
                        key={controller.id}
                        type='button'
                        onClick={() => {
                            if (relatedTrack?.trackId) {
                                selectTrack(relatedTrack.trackId);
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
