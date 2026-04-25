'use client';

import { useMemo } from 'react';
import {
    projectAnimationTrackSummary,
    projectMediaActiveKeyframe,
    projectMediaPlaybackState,
    projectMediaSelection,
    projectMediaSelectionSpan,
    projectMediaSelectedKeyframes,
    projectMediaTimelineTracks,
    projectMediaTweenSpan,
    selectMediaCursorIndex,
    selectMediaPlayback,
    selectMediaSelection,
    selectMediaTimeline,
    selectShotInspectorView,
    projectRigControllers,
    projectRigControllerTimelineTracks,
    selectActiveRig,
    projectActiveSequenceView,
    projectSequenceTimelineTracks,
    selectActiveSequence,
    selectActiveSequenceView,
    useWorkspaceProjectionState as useRuntimeStore,
    useWorkspaceVisualState,
} from '@/runtime/projection';
import {
    timelineIntentClockPause,
    timelineIntentClockSeek,
    timelineIntentKeyframeCreate,
    timelineIntentKeyframeDelete,
    timelineIntentKeyframeUpdate,
    timelineIntentKeyframesOffset,
    timelineIntentKeyframesReverseSpan,
    timelineIntentKeyframesUpdate,
} from '@/ui/timeline/timelineIntent.js';
import { useMediaTimelineSelectionStore } from '../shared/useMediaTimelineSelectionStore.js';
import { RigInspectorPanel } from '@/ui/rigging/RigInspectorPanel.jsx';
import { MediaInspectorHeader } from './MediaInspectorHeader.jsx';
import { AnimationKeyframeInspector } from './animation/AnimationKeyframeInspector.jsx';
import { AnimationMultiKeyframeInspector } from './animation/AnimationMultiKeyframeInspector.jsx';
import { ShotInspectorPanel } from './animation/ShotInspectorPanel.jsx';
import { AnimationTrackInspector } from './animation/AnimationTrackInspector.jsx';
import { AnimationTweenInspector } from './animation/AnimationTweenInspector.jsx';
import { PodcastCueInspector } from './podcast/PodcastCueInspector.jsx';
import { SequencerInspectorPanel } from './SequencerInspectorPanel.jsx';
import { VideoClipInspector } from './video/VideoClipInspector.jsx';
import {
    actionButtonStyle,
    actionRowStyle,
    cardStyle,
    sectionStyle,
    sectionTitleStyle,
} from './inspectorStyles.js';

function keyframeTargetFrame(activeKeyframe, activeTrack, currentFrame) {
    if (activeKeyframe) return Number(activeKeyframe.time ?? 0);
    if (activeTrack?.keyframes?.length) return Number(activeTrack.keyframes[0]?.time ?? 0);
    return Number(currentFrame ?? 0);
}

function sharedSelectionDescription({ selection, activeTrack, activeKeyframe, tracks }) {
    if (activeTrack?.controllerLabel) {
        if (activeTrack?.selectedKeyframes?.length > 1) {
            return `${activeTrack.selectedKeyframes.length} keyframes selected on controller ${activeTrack.controllerLabel}`;
        }
        if (activeKeyframe) {
            return `${activeTrack.controllerLabel} keyframe selected on ${activeTrack.property ?? activeTrack.id}`;
        }
        return `${activeTrack.controllerLabel} controller track selected`;
    }
    if (activeTrack?.selectedKeyframes?.length > 1) {
        return `${activeTrack.selectedKeyframes.length} keyframes selected on ${activeTrack?.property ?? activeTrack?.id ?? 'track'}`;
    }
    if (activeKeyframe) {
        return `${activeKeyframe.id} selected on ${activeTrack?.property ?? activeTrack?.id ?? 'track'}`;
    }
    if (activeTrack) {
        return `${activeTrack.property ?? activeTrack.id} selected`;
    }
    if (selection.count > 0) {
        return `${selection.count} document selections active`;
    }
    return `${tracks.length} timeline tracks visible`;
}

export function MediaInspectorPanel({ mode }) {
    const selectionState = useRuntimeStore(selectMediaSelection);
    const runtimeScene = useRuntimeStore((state) => state.scene);
    const document = useRuntimeStore((state) => state.document);
    const timeline = useRuntimeStore(selectMediaTimeline);
    const playbackState = useRuntimeStore(selectMediaPlayback);
    const cursorIndex = useRuntimeStore(selectMediaCursorIndex);
    const activeRig = useRuntimeStore(selectActiveRig);
    const activeSequence = useRuntimeStore((state) => selectActiveSequence(state.document));
    const nodes = useWorkspaceVisualState((state) => state.nodes || {});
    const shotInspector = useWorkspaceVisualState(selectShotInspectorView);
    const selectedTrackId = useMediaTimelineSelectionStore((state) => state.selectedTrackId);
    const selectedKeyframeId = useMediaTimelineSelectionStore((state) => state.selectedKeyframeId);
    const selectedKeyframeIds = useMediaTimelineSelectionStore((state) => state.selectedKeyframeIds);
    const selectedSequenceClipId = useMediaTimelineSelectionStore((state) => state.selectedSequenceClipId);
    const selectTrack = useMediaTimelineSelectionStore((state) => state.selectTrack);
    const selection = useMemo(() => projectMediaSelection(selectionState), [selectionState]);
    const tracks = useMemo(() => projectMediaTimelineTracks(timeline), [timeline]);
    const rigTracks = useMemo(
        () =>
            mode.id === 'animation'
                ? projectRigControllerTimelineTracks(activeRig, document?.motion)
                : [],
        [mode.id, activeRig, document?.motion]
    );
    const sequenceTracks = useMemo(
        () => projectSequenceTimelineTracks(activeSequence),
        [activeSequence]
    );
    const controllerMap = useMemo(() => {
        const entries = projectRigControllers(activeRig);
        return Object.fromEntries(entries.map((controller) => [controller.id, controller]));
    }, [activeRig]);
    const projectedTracks = mode.id === 'animation' && rigTracks.length ? rigTracks : tracks;
    const playback = useMemo(
        () => projectMediaPlaybackState({ playback: playbackState, cursorIndex, timeline }),
        [playbackState, cursorIndex, timeline]
    );
    const sequenceView = useMemo(
        () =>
            selectActiveSequenceView({
                document,
                scene: runtimeScene,
                playback: playbackState,
            }) ??
            projectActiveSequenceView(document, { frame: Number(playback.time ?? 0) }),
        [document, runtimeScene, playbackState, playback.time]
    );
    const allTracks = useMemo(
        () => [...sequenceTracks, ...projectedTracks],
        [sequenceTracks, projectedTracks]
    );
    const activeTrack = useMemo(
        () => allTracks.find((track) => track.id === selectedTrackId) ?? null,
        [allTracks, selectedTrackId]
    );
    const activeSequenceClip = useMemo(
        () =>
            activeTrack?.kind === 'sequence-track' && selectedSequenceClipId
                ? (activeTrack.clips || []).find((clip) => clip?.id === selectedSequenceClipId) ?? null
                : null,
        [activeTrack, selectedSequenceClipId]
    );
    const activeKeyframe = useMemo(
        () => projectMediaActiveKeyframe(activeTrack, selectedKeyframeId),
        [activeTrack, selectedKeyframeId]
    );
    const selectedKeyframes = useMemo(
        () => projectMediaSelectedKeyframes(activeTrack, selectedKeyframeIds),
        [activeTrack, selectedKeyframeIds]
    );
    const selectionSpan = useMemo(
        () => projectMediaSelectionSpan(activeTrack, selectedKeyframeIds),
        [activeTrack, selectedKeyframeIds]
    );
    const animationSummary = useMemo(
        () => (mode.id === 'animation' && activeTrack ? projectAnimationTrackSummary(activeTrack) : null),
        [mode.id, activeTrack]
    );
    const tweenSpan = useMemo(
        () =>
            mode.id === 'animation' && selectedKeyframeIds.length <= 1
                ? projectMediaTweenSpan(activeTrack, selectedKeyframeId)
                : null,
        [mode.id, activeTrack, selectedKeyframeId, selectedKeyframeIds.length]
    );
    const currentFrame = Math.max(0, Number(playback.time ?? 0));
    const jumpFrame = keyframeTargetFrame(activeKeyframe, activeTrack, currentFrame);
    const canDeleteKeyframe = Boolean(activeTrack?.clipId && activeKeyframe?.id);
    const canDuplicateKeyframe = Boolean(activeTrack?.nodeId && activeTrack?.property && activeKeyframe?.id);
    function handleJumpToFrame() {
        timelineIntentClockPause();
        timelineIntentClockSeek({ time: jumpFrame });
    }

    function handleDeleteKeyframe() {
        if (!canDeleteKeyframe) return;
        timelineIntentKeyframeDelete({
            clipId: activeTrack.clipId,
            keyframeId: activeKeyframe.id,
        });
        selectTrack(activeTrack.id);
    }

    function handleDuplicateKeyframe() {
        if (!canDuplicateKeyframe) return;

        const duplicateTime = currentFrame !== activeKeyframe.time ? currentFrame : currentFrame + 1;
        timelineIntentKeyframeCreate({
            clipId: activeTrack.clipId,
            nodeId: activeTrack.nodeId,
            property: activeTrack.property,
            timeMs: duplicateTime,
            value: activeKeyframe.value,
            easing: activeKeyframe.easing,
        });
    }

    function patchSelectedKeyframe(patch) {
        if (!activeTrack?.clipId || !activeKeyframe?.id) return;
        timelineIntentKeyframeUpdate({
            clipId: activeTrack.clipId,
            keyframeId: activeKeyframe.id,
            patch,
        });
    }

    function patchSelectedKeyframes(patch) {
        if (!activeTrack?.clipId || selectedKeyframes.length <= 1) return;
        timelineIntentKeyframesUpdate({
            clipId: activeTrack.clipId,
            keyframeIds: selectedKeyframes.map((keyframe) => keyframe.id),
            patch,
        });
    }

    function offsetSelectedKeyframes(delta) {
        if (!activeTrack?.clipId || selectedKeyframes.length <= 1) return;
        timelineIntentKeyframesOffset({
            clipId: activeTrack.clipId,
            keyframes: selectedKeyframes,
            delta,
        });
    }

    function reverseSelectedKeyframes() {
        if (!activeTrack?.clipId || selectedKeyframes.length <= 1) return;
        timelineIntentKeyframesReverseSpan({
            clipId: activeTrack.clipId,
            keyframes: selectedKeyframes,
        });
    }

    function createControllerKeyframe({ value, time }) {
        if (!trackWithSelection?.controller || !activeTrack?.property) return;
        timelineIntentKeyframeCreate({
            clipId: activeTrack.clipId,
            nodeId: trackWithSelection.controller.nodeRef,
            property: activeTrack.property,
            timeMs: time,
            value,
            easing: activeKeyframe?.easing ?? 'linear',
        });
    }

    const trackWithSelection = activeTrack
        ? {
              ...activeTrack,
              selectedKeyframes,
              controller:
                  activeTrack.controllerId != null
                      ? controllerMap[activeTrack.controllerId] ?? null
                      : null,
          }
        : null;

    return (
        <div style={cardStyle()}>
            <MediaInspectorHeader
                trackLabel={activeTrack?.property ?? activeTrack?.id ?? 'No track selected'}
                nodeLabel={
                    activeTrack?.controllerLabel
                        ? `${activeTrack.controllerLabel} → ${activeTrack?.nodeId ?? 'unbound'}`
                        : activeTrack?.kind === 'sequence-track'
                        ? activeTrack?.sequenceId ?? activeSequence?.id ?? 'No sequence selected'
                        : activeTrack?.nodeId ?? selection.primary ?? 'No node selected'
                }
                frameLabel={activeKeyframe?.time ?? currentFrame}
                timelineLabel={mode.id}
            />

            <div style={{ ...sectionStyle(), marginTop: 10 }}>
                <div style={sectionTitleStyle()}>Actions</div>
                <div style={actionRowStyle()}>
                    <button type='button' onClick={handleJumpToFrame} style={actionButtonStyle()}>
                        Go To Frame
                    </button>
                    <button
                        type='button'
                        disabled={!canDeleteKeyframe}
                        onClick={handleDeleteKeyframe}
                        style={actionButtonStyle({ disabled: !canDeleteKeyframe, danger: true })}>
                        Delete
                    </button>
                    <button
                        type='button'
                        disabled={!canDuplicateKeyframe}
                        onClick={handleDuplicateKeyframe}
                        style={actionButtonStyle({ disabled: !canDuplicateKeyframe })}>
                        Duplicate
                    </button>
                </div>
            </div>

            <div style={{ ...sectionStyle(), marginTop: 10 }}>
                <div style={sectionTitleStyle()}>Selection Info</div>
                <div style={{ fontSize: 12, color: '#334155' }}>
                    {sharedSelectionDescription({
                        selection,
                        activeTrack: trackWithSelection,
                        activeKeyframe,
                        tracks: allTracks,
                    })}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                    {selection.count} document selection(s) · {allTracks.length} visible timeline track(s) · {selectedKeyframes.length} timeline keyframe selection(s)
                </div>
            </div>

            <div style={{ ...sectionStyle(), marginTop: 10 }}>
                <div style={sectionTitleStyle()}>Mode Context</div>
                <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{mode.label}</div>
                <div style={{ fontSize: 12, color: '#334155' }}>{mode.summary}</div>
                {activeSequence ? (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                        Sequence: {activeSequence.label || activeSequence.id} · Active camera:{' '}
                        {sequenceView?.activeCamera?.cameraNodeRef ?? 'None'}
                    </div>
                ) : null}
            </div>

            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {activeSequence ? (
                    <SequencerInspectorPanel
                        sequence={activeSequence}
                        sequenceView={sequenceView}
                        track={activeTrack?.kind === 'sequence-track' ? activeTrack : null}
                        clip={activeSequenceClip}
                        modeId={mode.id}
                        currentFrame={currentFrame}
                        selection={selection}
                    />
                ) : null}
                {mode.id === 'animation' ? (
                    <>
                        <ShotInspectorPanel inspector={shotInspector} />
                        {selectedKeyframes.length > 1 ? (
                            <AnimationMultiKeyframeInspector
                                selectionSpan={selectionSpan}
                                batchEasing={(easing) => patchSelectedKeyframes({ easing })}
                                offsetSelection={offsetSelectedKeyframes}
                                reverseSelection={reverseSelectedKeyframes}
                            />
                        ) : (
                            <>
                                <AnimationKeyframeInspector keyframe={activeKeyframe} onPatchKeyframe={patchSelectedKeyframe} />
                                <AnimationTweenInspector tweenSpan={tweenSpan} onPatchKeyframe={patchSelectedKeyframe} />
                            </>
                        )}
                        <AnimationTrackInspector track={activeTrack} summary={animationSummary} keyframe={activeKeyframe} />
                        {trackWithSelection?.controller ? (
                            <RigInspectorPanel
                                rig={activeRig}
                                controller={trackWithSelection.controller}
                                track={activeTrack}
                                nodes={nodes}
                                currentFrame={currentFrame}
                                onCreateKeyframe={createControllerKeyframe}
                            />
                        ) : null}
                    </>
                ) : null}
                {mode.id === 'video' ? (
                    <VideoClipInspector track={activeTrack} duration={playback.duration} />
                ) : null}
                {mode.id === 'podcast' ? (
                    <PodcastCueInspector track={activeTrack} keyframe={activeKeyframe} currentFrame={currentFrame} />
                ) : null}
            </div>
        </div>
    );
}
