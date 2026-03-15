'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    createSequence,
    createSequenceClip,
    createSequenceTrack,
} from '@/runtime/sequencer/sequenceRegistry.js';
import {
    timelineIntentSequenceClipCreate,
    timelineIntentSequenceClipDelete,
    timelineIntentSequenceClipUpdate,
    timelineIntentSequenceCreate,
    timelineIntentSequenceSetActive,
    timelineIntentSequenceTrackCreate,
} from '@/ui/timeline/timelineIntent.js';
import { actionButtonStyle, actionRowStyle, sectionStyle, sectionTitleStyle } from './inspectorStyles.js';

function infoRow(label, value) {
    return (
        <>
            <div style={{ color: '#64748b' }}>{label}</div>
            <div style={{ color: '#0f172a', fontWeight: 600 }}>{value}</div>
        </>
    );
}

function inferTrackType(modeId) {
    if (modeId === 'video') return 'camera';
    if (modeId === 'podcast') return 'audio';
    return 'shot';
}

function inferTrackLabel(modeId) {
    if (modeId === 'video') return 'Camera Track';
    if (modeId === 'podcast') return 'Audio Track';
    return 'Shot Track';
}

export function SequencerInspectorPanel({
    sequence,
    sequenceView,
    track,
    clip,
    modeId,
    currentFrame,
    selection,
}) {
    const activeCamera = sequenceView?.activeCamera ?? null;
    const clipCount = Array.isArray(track?.clips) ? track.clips.length : 0;
    const selectedTrackId =
        track?.kind === 'sequence-track' ? String(track.id).split(':').at(-1) : null;
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
        setLabelDraft(clip?.label ?? '');
        setBindingDraft(clip?.cameraNodeRef ?? clip?.audioAsset ?? '');
    }, [clip?.id, clip?.label, clip?.cameraNodeRef, clip?.audioAsset]);

    function handleCreateSequence() {
        const nextSequence = createSequence({
            id: crypto.randomUUID(),
            label: `${modeId === 'video' ? 'Video' : modeId === 'podcast' ? 'Podcast' : 'Animation'} Sequence`,
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
            type: inferTrackType(modeId),
            label: inferTrackLabel(modeId),
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
            track?.kind === 'sequence-track'
                ? String(track.id).split(':').at(-1)
                : Object.values(sequence?.tracks || {})[0]?.id ?? null;
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
        if (!sequence?.id || !selectedTrackId || !clip?.id) return;
        timelineIntentSequenceClipUpdate({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            clipId: clip.id,
            patch,
        });
    }

    function handleDeleteClip() {
        if (!sequence?.id || !selectedTrackId || !clip?.id) return;
        timelineIntentSequenceClipDelete({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            clipId: clip.id,
        });
    }

    function handleMoveClip(targetTrackId) {
        if (!sequence?.id || !selectedTrackId || !clip?.id || !targetTrackId || targetTrackId === selectedTrackId) {
            return;
        }

        timelineIntentSequenceClipCreate({
            sequenceId: sequence.id,
            trackId: targetTrackId,
            clip: createSequenceClip({ ...clip }),
        });
        timelineIntentSequenceClipDelete({
            sequenceId: sequence.id,
            trackId: selectedTrackId,
            clipId: clip.id,
        });
    }

    function handleSaveMetadata() {
        if (!clip) return;
        const patch = {
            label: labelDraft.trim() || clip.label || clip.id,
        };

        if (track?.trackType === 'audio') {
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
                {infoRow('Track Type', track?.trackType ?? 'No track selected')}
                {infoRow('Visible Clips', String(clipCount))}
                {infoRow('Selected Clip', clip?.label ?? clip?.id ?? 'None')}
                {infoRow('Start', clip ? `${clip.start}f` : '—')}
                {infoRow('End', clip ? `${clip.end}f` : '—')}
                {infoRow('Binding', clip?.cameraNodeRef ?? clip?.audioAsset ?? 'None')}
            </div>
            {clip ? (
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
                            {track?.trackType === 'audio' ? 'Audio Asset' : 'Camera Node'}
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
                        <button
                            type='button'
                            onClick={handleDeleteClip}
                            style={actionButtonStyle({ danger: true })}>
                            Delete Clip
                        </button>
                    </div>
                    <div style={{ ...actionRowStyle(), marginTop: 10 }}>
                        <button type='button' onClick={() => patchClip({ start: Math.max(0, Number(clip.start ?? 0) - 1), end: Math.max(Number(clip.start ?? 0), Number(clip.end ?? 0) - 1) })} style={actionButtonStyle()}>
                        Start -1f
                        </button>
                        <button type='button' onClick={() => patchClip({ start: Number(clip.start ?? 0) + 1 })} style={actionButtonStyle()}>
                        Start +1f
                        </button>
                        <button type='button' onClick={() => patchClip({ end: Math.max(Number(clip.start ?? 0), Number(clip.end ?? 0) - 1) })} style={actionButtonStyle()}>
                        End -1f
                        </button>
                        <button type='button' onClick={() => patchClip({ end: Number(clip.end ?? 0) + 1 })} style={actionButtonStyle()}>
                        End +1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                patchClip({
                                    start: Math.max(0, Number(clip.start ?? 0) - 1),
                                    end: Math.max(Number(clip.start ?? 0), Number(clip.end ?? 0) - 1),
                                })
                            }
                            style={actionButtonStyle()}>
                        Move -1f
                        </button>
                        <button
                            type='button'
                            onClick={() =>
                                patchClip({
                                    start: Number(clip.start ?? 0) + 1,
                                    end: Number(clip.end ?? 0) + 1,
                                })
                            }
                            style={actionButtonStyle()}>
                        Move +1f
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}
