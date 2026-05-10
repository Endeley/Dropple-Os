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

    const provenance = serviceState.provenance ?? null;
    const queueStatus = provenance?.status ?? null;
    const progress = provenance?.progress ?? null;
    const activeRecord = serviceState.activeRecord ?? null;
    const recentRecords = serviceState.recentRecords ?? [];
    const progressLabel = useMemo(() => {
        if (!progress) return null;
        return `${progress.completedFrameCount}/${progress.totalFrames} frames`;
    }, [progress]);

    function shortId(value) {
        if (!value) return '—';
        if (value.length <= 18) return value;
        return `${value.slice(0, 18)}…`;
    }

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
            {(provenance?.manifestId || provenance?.sessionId) && (
                <div
                    style={{
                        marginTop: 12,
                        display: 'grid',
                        gridTemplateColumns: '120px minmax(0, 1fr)',
                        gap: '6px 10px',
                        fontSize: 12,
                    }}>
                    <div style={{ color: '#64748b' }}>Manifest</div>
                    <div title={provenance?.manifestId ?? undefined}>{shortId(provenance?.manifestId)}</div>
                    <div style={{ color: '#64748b' }}>Session</div>
                    <div title={provenance?.sessionId ?? undefined}>{shortId(provenance?.sessionId)}</div>
                    <div style={{ color: '#64748b' }}>Assignment</div>
                    <div title={provenance?.assignmentId ?? undefined}>{shortId(provenance?.assignmentId)}</div>
                    <div style={{ color: '#64748b' }}>Checkpoint</div>
                    <div title={provenance?.checkpointId ?? undefined}>{shortId(provenance?.checkpointId)}</div>
                    <div style={{ color: '#64748b' }}>Execution</div>
                    <div title={provenance?.executionId ?? undefined}>{shortId(provenance?.executionId)}</div>
                    <div style={{ color: '#64748b' }}>Registry Rev</div>
                    <div>{provenance?.registryRevision ?? 0}</div>
                    <div style={{ color: '#64748b' }}>History</div>
                    <div>{provenance?.historyCount ?? 0} event(s)</div>
                </div>
            )}
            {activeRecord ? (
                <div style={{ marginTop: 12, fontSize: 12 }}>
                    <div style={{ color: '#64748b', marginBottom: 6 }}>Active Execution Record</div>
                    <div style={{ display: 'grid', gap: 4 }}>
                        {activeRecord.history.map((entry) => (
                            <div
                                key={entry.eventId}
                                style={{
                                    borderRadius: 8,
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    padding: '6px 8px',
                                }}>
                                <strong>{entry.status}</strong>
                                {entry.progress
                                    ? ` · ${entry.progress.completedFrameCount}/${entry.progress.totalFrames} frames`
                                    : ''}
                                {entry.revision ? ` · rev ${entry.revision}` : ''}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
            {recentRecords.length > 1 ? (
                <div style={{ marginTop: 12, fontSize: 12 }}>
                    <div style={{ color: '#64748b', marginBottom: 6 }}>Recent Executions</div>
                    <div style={{ display: 'grid', gap: 4 }}>
                        {recentRecords.map((record) => (
                            <div
                                key={record.recordId}
                                style={{
                                    borderRadius: 8,
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    padding: '6px 8px',
                                }}>
                                <strong>{record.status}</strong>
                                {record.progress
                                    ? ` · ${record.progress.completedFrameCount}/${record.progress.totalFrames} frames`
                                    : ''}
                                {record.manifestId ? ` · ${shortId(record.manifestId)}` : ''}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
            {statusMessage ? <p style={{ marginTop: 8 }}>{statusMessage}</p> : null}
        </div>
    );
}
