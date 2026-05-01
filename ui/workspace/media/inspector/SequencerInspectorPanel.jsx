'use client';

import { useEffect, useMemo, useState } from 'react';
import { isPodcastOverlayMode } from '../mediaModes.js';
import {
    createSequence,
    createSequenceClip,
    createSequenceTrack,
} from '@/runtime/sequencer/sequenceRegistry.js';
import {
    timelineIntentSequenceClipMove,
    timelineIntentSequenceClipTrim,
    timelineIntentSequenceClipSplit,
    timelineIntentSequenceClipCreate,
    timelineIntentSequenceClipDelete,
    timelineIntentSequenceClipUpdate,
    timelineIntentSequenceCreate,
    timelineIntentSequenceSetActive,
    timelineIntentSequenceTrackCreate,
} from '@/ui/timeline/timelineIntent.js';
import { exportIntentTargetDelete, exportIntentTargetUpsert } from '@/ui/export/exportIntent.js';
import { actionButtonStyle, actionRowStyle, sectionStyle, sectionTitleStyle } from './inspectorStyles.js';

function infoRow(label, value) {
    return (
        <>
            <div style={{ color: '#64748b' }}>{label}</div>
            <div style={{ color: '#0f172a', fontWeight: 600 }}>{value}</div>
        </>
    );
}

function inferTrackType(modeId, overlayId = null) {
    if (modeId === 'video') return 'camera';
    if (modeId === 'audio' || isPodcastOverlayMode(modeId, overlayId)) return 'audio';
    return 'shot';
}

function inferTrackLabel(modeId, overlayId = null) {
    if (modeId === 'video') return 'Camera Track';
    if (modeId === 'audio' || isPodcastOverlayMode(modeId, overlayId)) return 'Audio Track';
    return 'Shot Track';
}

function buildDefaultExportTarget(modeId, sequence, overlayId = null) {
    if (modeId === 'video') {
        return {
            id: 'mp4:master',
            type: 'mp4',
            delivery: 'master',
            label: 'Video Master',
            width: 1920,
            height: 1080,
            frameRate: Number(sequence?.frameRate ?? 24),
            videoCodec: 'h264',
            audioCodec: 'aac',
            includeVideo: true,
            includeAudio: true,
        };
    }

    if (modeId === 'audio' || isPodcastOverlayMode(modeId, overlayId)) {
        return {
            id: 'wav:podcast',
            type: 'wav',
            delivery: 'podcast',
            label: 'Podcast Master',
            sampleRate: 48000,
            channels: 2,
            includeVideo: false,
            includeAudio: true,
        };
    }

    return {
        id: 'gif:preview',
        type: 'gif',
        delivery: 'preview',
        label: 'Animation Preview',
        width: 1080,
        height: 1080,
        frameRate: Number(sequence?.frameRate ?? 24),
        includeVideo: true,
        includeAudio: false,
    };
}

export function SequencerInspectorPanel({
    sequence,
    sequenceView,
    track,
    modeId,
    overlayId = null,
    currentFrame,
    selection,
    inspector = null,
    exportTargets = [],
}) {
    const activeCamera = sequenceView?.activeCamera ?? null;
    const selectedTrack = inspector?.selectedTrack ?? null;
    const selectedClip = inspector?.selectedClip ?? null;
    const clipCount = Number.isFinite(selectedTrack?.clipCount)
        ? Number(selectedTrack.clipCount)
        : Array.isArray(track?.clips)
          ? track.clips.length
          : 0;
    const selectedTrackId =
        selectedTrack?.id ??
        (track?.kind === 'sequence-track' ? String(track.id).split(':').at(-1) : null);
    const trackType = selectedTrack?.type ?? track?.trackType ?? 'generic';
    const orderedTrackIds = useMemo(
        () =>
            Object.values(sequence?.tracks || {})
                .sort((left, right) => (left?.order ?? 0) - (right?.order ?? 0))
                .map((entry) => entry.id),
        [sequence]
    );
    const currentTrackIndex = selectedTrackId ? orderedTrackIds.indexOf(selectedTrackId) : -1;
    const previousTrackId = currentTrackIndex > 0 ? orderedTrackIds[currentTrackIndex - 1] : null;
    const nextTrackId =
        currentTrackIndex >= 0 && currentTrackIndex < orderedTrackIds.length - 1
            ? orderedTrackIds[currentTrackIndex + 1]
            : null;
    const [labelDraft, setLabelDraft] = useState('');
    const [bindingDraft, setBindingDraft] = useState('');

    useEffect(() => {
        setLabelDraft(selectedClip?.label ?? '');
        setBindingDraft(selectedClip?.binding?.value ?? '');
    }, [selectedClip?.id, selectedClip?.label, selectedClip?.binding?.value]);

    function handleCreateSequence() {
        const nextSequence = createSequence({
            id: crypto.randomUUID(),
            label: `${
                modeId === 'video'
                    ? 'Video'
                    : modeId === 'audio' || isPodcastOverlayMode(modeId, overlayId)
                      ? 'Audio'
                      : 'Animation'
            } Sequence`,
            duration: 240,
            frameRate: 24,
        });
        if (!nextSequence) return;
        timelineIntentSequenceCreate({ sequence: nextSequence });
        timelineIntentSequenceSetActive({ sequenceId: nextSequence.id });
    }

    function handleCreateTrack() {
        if (!sequence?.id) return;
        const nextTrack = createSequenceTrack({
            id: crypto.randomUUID(),
            type: inferTrackType(modeId, overlayId),
            label: inferTrackLabel(modeId, overlayId),
            order: Object.keys(sequence?.tracks || {}).length,
        });
        if (!nextTrack) return;
        timelineIntentSequenceTrackCreate({
            sequenceId: sequence.id,
            track: nextTrack,
        });
    }

    function handleCreateClip() {
        if (!sequence?.id) return;

        const targetTrackId =
            selectedTrackId ??
            (track?.kind === 'sequence-track'
                ? String(track.id).split(':').at(-1)
                : Object.values(sequence?.tracks || {})[0]?.id ?? null);
        const targetTrack = targetTrackId ? sequence?.tracks?.[targetTrackId] ?? null : null;
        if (!targetTrackId || !targetTrack) return;

        const nextClip = createSequenceClip({
            id: crypto.randomUUID(),
            label: targetTrack.type === 'camera' ? 'Camera Clip' : 'Sequence Clip',
            start: currentFrame,
            end: currentFrame + 24,
            cameraNodeRef:
                targetTrack.type === 'camera' || targetTrack.type === 'shot'
                    ? selection?.primary ?? null
                    : null,
            assetId: targetTrack.type === 'audio' ? selection?.primary ?? null : null,
            audioAsset: targetTrack.type === 'audio' ? selection?.primary ?? null : null,
        });
        if (!nextClip) return;

        timelineIntentSequenceClipCreate({
            sequenceId: sequence.id,
            trackId: targetTrackId,
            clip: nextClip,
        });
    }

    function patchClip(patch) {
        if (!sequence?.id || !selectedTrackId || !selectedClip?.clipId) return;
        timelineIntentSequenceClipUpdate({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            clipId: selectedClip.clipId,
            patch,
        });
    }

    function handleDeleteClip() {
        if (!sequence?.id || !selectedTrackId || !selectedClip?.clipId) return;
        timelineIntentSequenceClipDelete({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            clipId: selectedClip.clipId,
        });
    }

    function handleMoveClip(targetTrackId) {
        if (
            !sequence?.id ||
            !selectedTrackId ||
            !selectedClip?.clipId ||
            !targetTrackId ||
            targetTrackId === selectedTrackId
        ) {
            return;
        }

        timelineIntentSequenceClipMove({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            toTrackId: targetTrackId,
            clipId: selectedClip.clipId,
            start: Number(selectedClip.start ?? 0),
            end: Number(selectedClip.end ?? 0),
        });
    }

    function handleSplitClip() {
        if (!sequence?.id || !selectedTrackId || !selectedClip?.clipId) return;
        const splitAt = Math.max(
            Number(selectedClip.start ?? 0) + 1,
            Math.min(Number(selectedClip.end ?? 0) - 1, Math.round(currentFrame)),
        );
        if (
            !Number.isFinite(splitAt) ||
            splitAt <= Number(selectedClip.start ?? 0) ||
            splitAt >= Number(selectedClip.end ?? 0)
        ) {
            return;
        }
        timelineIntentSequenceClipSplit({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            clipId: selectedClip.clipId,
            splitAt,
        });
    }

    function handleSaveMetadata() {
        if (!selectedClip) return;
        const patch = {
            label: labelDraft.trim() || selectedClip.label || selectedClip.clipId,
        };

        if (trackType === 'audio') {
            patch.assetId = bindingDraft.trim() || null;
            patch.audioAsset = bindingDraft.trim() || null;
        } else {
            patch.cameraNodeRef = bindingDraft.trim() || null;
        }

        patchClip(patch);
    }

    function handleBindSelection() {
        const nextBinding = selection?.primary ?? '';
        setBindingDraft(nextBinding);
    }

    function handleSaveDefaultExportTarget() {
        exportIntentTargetUpsert({
            target: buildDefaultExportTarget(modeId, sequence, overlayId),
        });
    }

    function handleDeleteExportTarget(targetId) {
        exportIntentTargetDelete({ targetId });
    }

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Sequencer Context</div>
            <div style={actionRowStyle()}>
                <button type='button' onClick={handleCreateSequence} style={actionButtonStyle()}>
                    {sequence ? 'New Sequence' : 'Create Sequence'}
                </button>
                <button
                    type='button'
                    disabled={!sequence}
                    onClick={handleCreateTrack}
                    style={actionButtonStyle({ disabled: !sequence })}>
                    Add Track
                </button>
                <button
                    type='button'
                    disabled={!sequence}
                    onClick={handleCreateClip}
                    style={actionButtonStyle({ disabled: !sequence })}>
                    Add Clip At Playhead
                </button>
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '110px minmax(0, 1fr)',
                    gap: '6px 10px',
                    fontSize: 12,
                }}>
                {infoRow('Sequence', sequence?.label ?? sequence?.id ?? 'No active sequence')}
                {infoRow('Frame Rate', `${sequence?.frameRate ?? 24} fps`)}
                {infoRow('Active Camera', activeCamera?.cameraNodeRef ?? 'None')}
                {infoRow('Track Type', trackType ?? 'No track selected')}
                {infoRow('Visible Clips', String(clipCount))}
                {infoRow('Selected Clip', selectedClip?.label ?? selectedClip?.clipId ?? 'None')}
                {infoRow('Start', selectedClip ? `${selectedClip.start}f` : '—')}
                {infoRow('End', selectedClip ? `${selectedClip.end}f` : '—')}
                {infoRow('Binding', selectedClip?.binding?.value ?? 'None')}
                {infoRow(
                    'Active Media',
                    `${inspector?.activeVideoClipCount ?? 0} video · ${inspector?.activeAudioClipCount ?? 0} audio`
                )}
            </div>
            {selectedClip ? (
                <>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '110px minmax(0, 1fr)',
                            gap: '6px 10px',
                            fontSize: 12,
                            marginTop: 10,
                        }}>
                        <div style={{ color: '#64748b' }}>Label</div>
                        <input
                            value={labelDraft}
                            onChange={(event) => setLabelDraft(event.target.value)}
                            style={{
                                borderRadius: 8,
                                border: '1px solid rgba(148, 163, 184, 0.35)',
                                padding: '6px 8px',
                                fontSize: 12,
                                color: '#0f172a',
                                background: '#fff',
                            }}
                        />
                        <div style={{ color: '#64748b' }}>
                            {trackType === 'audio' ? 'Audio Asset' : 'Camera Node'}
                        </div>
                        <input
                            value={bindingDraft}
                            onChange={(event) => setBindingDraft(event.target.value)}
                            style={{
                                borderRadius: 8,
                                border: '1px solid rgba(148, 163, 184, 0.35)',
                                padding: '6px 8px',
                                fontSize: 12,
                                color: '#0f172a',
                                background: '#fff',
                            }}
                        />
                    </div>
                    <div style={{ ...actionRowStyle(), marginTop: 10 }}>
                        <button type='button' onClick={handleSaveMetadata} style={actionButtonStyle()}>
                            Save Metadata
                        </button>
                        <button type='button' onClick={handleBindSelection} style={actionButtonStyle()}>
                            Bind Selection
                        </button>
                        <button
                            type='button'
                            disabled={!previousTrackId}
                            onClick={() => handleMoveClip(previousTrackId)}
                            style={actionButtonStyle({ disabled: !previousTrackId })}>
                            Move To Prev Track
                        </button>
                        <button
                            type='button'
                            disabled={!nextTrackId}
                            onClick={() => handleMoveClip(nextTrackId)}
                            style={actionButtonStyle({ disabled: !nextTrackId })}>
                            Move To Next Track
                        </button>
                        <button type='button' onClick={handleSplitClip} style={actionButtonStyle()}>
                            Split At Playhead
                        </button>
                        <button
                            type='button'
                            onClick={handleDeleteClip}
                            style={actionButtonStyle({ danger: true })}>
                            Delete Clip
                        </button>
                    </div>
                    <div style={{ ...actionRowStyle(), marginTop: 10 }}>
                        <button
                            type='button'
                            onClick={() =>
                                timelineIntentSequenceClipTrim({
                                    sequenceId: sequence.id,
                                    trackId: selectedTrackId,
                                    clipId: selectedClip.clipId,
                                    start: Math.max(0, Number(selectedClip.start ?? 0) - 1),
                                })
                            }
                            style={actionButtonStyle()}>
                            Start -1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                timelineIntentSequenceClipTrim({
                                    sequenceId: sequence.id,
                                    trackId: selectedTrackId,
                                    clipId: selectedClip.clipId,
                                    start: Math.min(Number(selectedClip.end ?? 0), Number(selectedClip.start ?? 0) + 1),
                                })
                            }
                            style={actionButtonStyle()}>
                            Start +1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                timelineIntentSequenceClipTrim({
                                    sequenceId: sequence.id,
                                    trackId: selectedTrackId,
                                    clipId: selectedClip.clipId,
                                    end: Math.max(Number(selectedClip.start ?? 0), Number(selectedClip.end ?? 0) - 1),
                                })
                            }
                            style={actionButtonStyle()}>
                            End -1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                timelineIntentSequenceClipTrim({
                                    sequenceId: sequence.id,
                                    trackId: selectedTrackId,
                                    clipId: selectedClip.clipId,
                                    end: Number(selectedClip.end ?? 0) + 1,
                                })
                            }
                            style={actionButtonStyle()}>
                            End +1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                timelineIntentSequenceClipMove({
                                    sequenceId: sequence.id,
                                    trackId: selectedTrackId,
                                    clipId: selectedClip.clipId,
                                    start: Math.max(0, Number(selectedClip.start ?? 0) - 1),
                                    end: Math.max(Number(selectedClip.start ?? 0), Number(selectedClip.end ?? 0) - 1),
                                })
                            }
                            style={actionButtonStyle()}>
                            Move -1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                timelineIntentSequenceClipMove({
                                    sequenceId: sequence.id,
                                    trackId: selectedTrackId,
                                    clipId: selectedClip.clipId,
                                    start: Number(selectedClip.start ?? 0) + 1,
                                    end: Number(selectedClip.end ?? 0) + 1,
                                })
                            }
                            style={actionButtonStyle()}>
                            Move +1f
                        </button>
                    </div>
                </>
            ) : null}
            <div style={{ ...sectionStyle(), marginTop: 10 }}>
                <div style={sectionTitleStyle()}>Export Targets</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                    Delivery presets are canonical document truth, not panel-local preferences.
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                    {exportTargets.length ? (
                        exportTargets.map((target) => (
                            <div
                                key={target.id}
                                style={{
                                    borderRadius: 10,
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    padding: '8px 10px',
                                    background: 'rgba(248, 250, 252, 0.8)',
                                    display: 'grid',
                                    gap: 4,
                                }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                                    {target.label ?? target.id}
                                </div>
                                <div style={{ fontSize: 12, color: '#475569' }}>
                                    {target.format} · {target.delivery}
                                    {target.width && target.height ? ` · ${target.width}x${target.height}` : ''}
                                    {target.frameRate ? ` · ${target.frameRate}fps` : ''}
                                    {target.sampleRate ? ` · ${target.sampleRate}Hz` : ''}
                                </div>
                                <div style={actionRowStyle()}>
                                    <button
                                        type='button'
                                        onClick={() => handleDeleteExportTarget(target.id)}
                                        style={actionButtonStyle({ danger: true })}>
                                        Delete Target
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ fontSize: 12, color: '#64748b' }}>No export targets saved yet.</div>
                    )}
                </div>
                <div style={{ ...actionRowStyle(), marginTop: 10 }}>
                    <button type='button' onClick={handleSaveDefaultExportTarget} style={actionButtonStyle()}>
                        Save Default Export
                    </button>
                </div>
            </div>
        </div>
    );
}
