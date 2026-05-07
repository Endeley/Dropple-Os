'use client';

import { useMemo, useState } from 'react';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { runExportGate } from '@/ui/export/exportGateClient.js';
import { performServiceExport } from '@/ui/export/exportExecutionClient.js';
import { useExportExecution } from '@/ui/export/useExportExecution.js';

/**
 * Minimal export UI.
 * First real consumer of the canonical export execution service.
 */
export default function ExportPanel() {
    const documentState = useWorkspaceProjectionState((state) => state?.document ?? null);
    const sceneState = useWorkspaceProjectionState((state) => state?.scene ?? null);
    const timelineState = useWorkspaceProjectionState((state) => state?.timeline ?? null);
    const playbackState = useWorkspaceProjectionState((state) => state?.playback ?? null);
    const eventsState = useWorkspaceProjectionState((state) => state?.events ?? []);
    const cursorIndex = useWorkspaceProjectionState((state) => state?.cursorIndex ?? -1);
    const runtimeSnapshot = useMemo(
        () => ({
            document: documentState,
            scene: sceneState,
            timeline: timelineState,
            playback: playbackState,
            events: eventsState,
            cursorIndex,
        }),
        [documentState, sceneState, timelineState, playbackState, eventsState, cursorIndex],
    );
    const { runWorkflow, performWorkflow, serviceState, reset } = useExportExecution();
    const [statusMessage, setStatusMessage] = useState('');

    const queueStatus = serviceState.workflow?.queueEntry?.status ?? null;
    const progress = serviceState.workflow?.progress ?? null;
    const progressLabel = useMemo(() => {
        if (!progress) return null;
        return `${progress.completedFrameCount}/${progress.totalFrames} frames`;
    }, [progress]);

    function onExportDroppleSpec() {
        runExportGate({
            onProceed: async () => {
                try {
                    const result = await performServiceExport({
                        snapshot: runtimeSnapshot,
                        runWorkflow,
                        performWorkflow,
                    });
                    setStatusMessage(result.message);
                } catch (error) {
                    const reason = error instanceof Error ? error.message : 'unknown export error';
                    console.warn('[ExportPanel] Export blocked:', reason);
                    setStatusMessage(`Export blocked: ${reason}`);
                }
            },
        });
    }

    return (
        <div style={{ padding: 12 }}>
            <h3>Export</h3>
            <button onClick={onExportDroppleSpec}>Export Dropple Spec</button>
            <button onClick={() => { reset(); setStatusMessage(''); }} style={{ marginLeft: 8 }}>
                Reset Export State
            </button>
            {queueStatus && (
                <p style={{ marginTop: 12 }}>
                    Status: <strong>{queueStatus}</strong>
                    {progressLabel ? ` (${progressLabel})` : ''}
                </p>
            )}
            {statusMessage ? <p style={{ marginTop: 8 }}>{statusMessage}</p> : null}
        </div>
    );
}
