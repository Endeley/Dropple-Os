import { evaluateSequence } from '../../sequencer/evaluation/evaluateSequence.js';
import { projectMediaAssetSummary } from './mediaSelectors.js';

function getDocument(stateOrDocument) {
    return stateOrDocument?.document ?? stateOrDocument ?? {};
}

function getRuntimeScene(stateOrDocument) {
    return stateOrDocument?.scene ?? null;
}

function getRuntimePlayback(stateOrDocument) {
    return stateOrDocument?.playback ?? null;
}

export function selectSequenceState(stateOrDocument) {
    const document = getDocument(stateOrDocument);
    return document?.sequences ?? { sequences: {}, activeSequenceId: null };
}

export function selectSequenceMap(stateOrDocument) {
    return selectSequenceState(stateOrDocument).sequences ?? {};
}

export function selectActiveSequenceId(stateOrDocument) {
    const runtimeSequenceId = getRuntimeScene(stateOrDocument)?.temporalContext?.sequenceId ?? null;
    if (runtimeSequenceId) return runtimeSequenceId;
    return selectSequenceState(stateOrDocument).activeSequenceId ?? null;
}

export function selectActiveSequence(stateOrDocument) {
    const sequenceId = selectActiveSequenceId(stateOrDocument);
    return sequenceId ? selectSequenceMap(stateOrDocument)[sequenceId] ?? null : null;
}

export function projectSequences(stateOrDocument) {
    return Object.values(selectSequenceMap(stateOrDocument));
}

export function projectSequenceTracks(sequence) {
    return Object.values(sequence?.tracks || {}).sort((a, b) => {
        const orderDelta = (a?.order ?? 0) - (b?.order ?? 0);
        if (orderDelta !== 0) return orderDelta;
        return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
    });
}

export function projectSequenceTimelineTracks(sequence) {
    return projectSequenceTracks(sequence).map((track) => {
        const clips = Object.values(track?.clips || {}).sort((a, b) => {
            const startDelta = Number(a?.start ?? 0) - Number(b?.start ?? 0);
            if (startDelta !== 0) return startDelta;
            return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
        });

        return {
            id: `sequence:${sequence?.id ?? 'unknown'}:${track.id}`,
            sequenceId: sequence?.id ?? null,
            label: track?.label ?? track?.id ?? 'Track',
            property: track?.label ?? track?.type ?? track?.id ?? 'Track',
            kind: 'sequence-track',
            trackType: track?.type ?? 'generic',
            clips,
            keyframes: clips.map((clip, index) => ({
                id: `${track?.id ?? 'track'}:clip:${clip?.id ?? index}`,
                time: Number(clip?.start ?? 0),
                value: clip?.label ?? clip?.id ?? index,
                easing: 'hold',
                interpolation: 'hold',
                clipId: clip?.id ?? null,
            })),
        };
    });
}

function decodeSequenceTrackId(trackId) {
    const value = String(trackId ?? '');
    if (value.startsWith('sequence:')) {
        return value.split(':').at(-1) ?? null;
    }
    return value || null;
}

function resolveSequenceTrack(sequence, trackId) {
    const resolvedTrackId = decodeSequenceTrackId(trackId);
    return resolvedTrackId ? sequence?.tracks?.[resolvedTrackId] ?? null : null;
}

function resolveSequenceClip(sequence, trackId, clipId) {
    const track = resolveSequenceTrack(sequence, trackId);
    return clipId && track?.clips ? track.clips[clipId] ?? null : null;
}

function resolveClipAsset(assets, clip) {
    if (!clip?.assetId) return null;

    const assetType = clip?.assetType ?? null;
    if (assetType === 'image') {
        return assets?.images?.[clip.assetId] ?? null;
    }
    if (assetType === 'video') {
        return assets?.videos?.[clip.assetId] ?? null;
    }
    if (assetType === 'audio') {
        return assets?.audio?.[clip.assetId] ?? null;
    }

    return (
        assets?.images?.[clip.assetId] ??
        assets?.videos?.[clip.assetId] ??
        assets?.audio?.[clip.assetId] ??
        null
    );
}

export function projectSequenceClipInspector({ sequence, assets = null, trackId = null, clipId = null, sequenceView = null } = {}) {
    const track = resolveSequenceTrack(sequence, trackId);
    const clip = resolveSequenceClip(sequence, trackId, clipId);
    if (!track || !clip) return null;

    const asset = resolveClipAsset(assets, clip);
    const assetSummary = asset ? projectMediaAssetSummary(asset, clip.assetId, clip.assetType) : null;
    const activeClipIds = new Set(
        [
            ...(sequenceView?.activeClips ?? []),
            ...(sequenceView?.activeAudioClips ?? []),
            ...(sequenceView?.activeVideoClips ?? []),
        ]
            .map((entry) => entry?.clip?.id)
            .filter(Boolean),
    );

    return {
        sequenceId: sequence?.id ?? null,
        trackId: track.id ?? null,
        trackType: track.type ?? 'generic',
        clipId: clip.id ?? null,
        label: clip.label ?? clip.id ?? 'Clip',
        start: Number(clip.start ?? 0),
        end: Number(clip.end ?? 0),
        durationFrames: Math.max(0, Number(clip.end ?? 0) - Number(clip.start ?? 0)),
        trimStartMs: Number(clip.trimStartMs ?? 0),
        trimEndMs: Number.isFinite(clip.trimEndMs) ? Number(clip.trimEndMs) : null,
        playbackRate: Number.isFinite(clip.playbackRate) ? Number(clip.playbackRate) : 1,
        gainDb: Number.isFinite(clip.gainDb) ? Number(clip.gainDb) : 0,
        muted: clip.muted === true,
        opacity: Number.isFinite(clip.opacity) ? Number(clip.opacity) : 1,
        fadeInMs: Number.isFinite(clip.fadeInMs) ? Number(clip.fadeInMs) : 0,
        fadeOutMs: Number.isFinite(clip.fadeOutMs) ? Number(clip.fadeOutMs) : 0,
        binding:
            track.type === 'camera' || track.type === 'shot'
                ? { kind: 'camera', value: clip.cameraNodeRef ?? clip.cameraRef ?? null }
                : track.type === 'audio'
                  ? { kind: 'asset', value: clip.assetId ?? clip.audioAsset ?? null }
                  : { kind: clip.assetId ? 'asset' : 'scene', value: clip.assetId ?? clip.sceneRef ?? null },
        asset: assetSummary,
        isActive: activeClipIds.has(clip.id),
    };
}

export function projectSequenceInspectorView({
    sequence,
    assets = null,
    sequenceView = null,
    selectedTrackId = null,
    selectedClipId = null,
} = {}) {
    if (!sequence) return null;

    const tracks = projectSequenceTracks(sequence);
    const selectedTrack = resolveSequenceTrack(sequence, selectedTrackId);
    const selectedClip = projectSequenceClipInspector({
        sequence,
        assets,
        trackId: selectedTrackId,
        clipId: selectedClipId,
        sequenceView,
    });

    return {
        sequenceId: sequence.id ?? null,
        label: sequence.label ?? sequence.id ?? 'Sequence',
        frameRate: Number.isFinite(sequence.frameRate) ? Number(sequence.frameRate) : 24,
        duration: Number.isFinite(sequence.duration) ? Number(sequence.duration) : 0,
        trackCount: tracks.length,
        activeCamera: sequenceView?.activeCamera ?? null,
        activeShot: sequenceView?.activeShot ?? null,
        activeAudioClipCount: Array.isArray(sequenceView?.activeAudioClips) ? sequenceView.activeAudioClips.length : 0,
        activeVideoClipCount: Array.isArray(sequenceView?.activeVideoClips) ? sequenceView.activeVideoClips.length : 0,
        selectedTrack: selectedTrack
            ? {
                  id: selectedTrack.id ?? null,
                  type: selectedTrack.type ?? 'generic',
                  label: selectedTrack.label ?? selectedTrack.id ?? 'Track',
                  order: Number(selectedTrack.order ?? 0),
                  clipCount: Object.keys(selectedTrack.clips ?? {}).length,
                  allowOverlap: selectedTrack.allowOverlap === true,
              }
            : null,
        selectedClip,
    };
}

export function projectActiveSequenceView(stateOrDocument, playback = {}) {
    const runtimePlayback = getRuntimePlayback(stateOrDocument);
    const document = getDocument(stateOrDocument);
    const sequence = selectActiveSequence(stateOrDocument);
    return evaluateSequence({
        sequence,
        assets: document?.assets ?? null,
        frame: playback?.frame ?? runtimePlayback?.frame ?? runtimePlayback?.time ?? null,
        timeMs: playback?.timeMs ?? runtimePlayback?.timeMs ?? null,
    });
}
