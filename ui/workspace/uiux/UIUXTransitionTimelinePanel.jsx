'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import {
    timelineIntentClockPause,
    timelineIntentClockPlay,
    timelineIntentClockSeek,
    timelineIntentKeyframeCreate,
} from '@/ui/timeline/timelineIntent.js';
import { motionIntentKeyframeDelete, motionIntentKeyframeUpdate } from '@/ui/motion/motionIntent.js';

function getTimelineDuration(document, timeline) {
    const timelineDuration = Number(timeline?.timelines?.default?.duration ?? 0);
    const clipDuration = Object.values(document?.motion?.clips ?? {}).reduce((max, clip) => {
        const lastKeyframe = Array.isArray(clip?.keyframes) ? clip.keyframes[clip.keyframes.length - 1] : null;
        const time = Number(lastKeyframe?.t ?? lastKeyframe?.time ?? 0);
        return Math.max(max, time);
    }, 0);

    return Math.max(600, timelineDuration, clipDuration);
}

function getDefaultValue(property, node) {
    if (property === 'opacity') {
        return Number(node?.style?.opacity ?? 1);
    }

    if (property === 'translateY') {
        return Number(node?.transform?.y ?? node?.layout?.y ?? 0);
    }

    return 0;
}

export function UIUXTransitionTimelinePanel({ node = null }) {
    const document = useWorkspaceProjectionState((state) => state.document ?? null);
    const timeline = useWorkspaceProjectionState((state) => state.timeline ?? null);
    const frameTime = useWorkspaceProjectionState((state) => Number(state.frameTime ?? 0));
    const playback = useWorkspaceProjectionState((state) => state.playback ?? { isPlaying: false });

    const [property, setProperty] = useState('opacity');
    const [value, setValue] = useState('1');
    const [easing, setEasing] = useState('ease-in-out');
    const [targetTime, setTargetTime] = useState('0');

    const duration = useMemo(() => getTimelineDuration(document, timeline), [document, timeline]);
    const activeNode = useMemo(() => {
        if (node?.id) return node;

        const nodes = Object.values(document?.sceneGraph?.nodes ?? {}).filter(Boolean);
        return nodes.length === 1 ? nodes[0] : null;
    }, [document?.sceneGraph?.nodes, node]);
    const selectedMotionClips = useMemo(
        () =>
            Object.values(document?.motion?.clips ?? {})
                .filter((clip) => clip?.target === activeNode?.id)
                .sort((left, right) => {
                    const leftKey = `${left?.target ?? ''}:${left?.property ?? ''}`;
                    const rightKey = `${right?.target ?? ''}:${right?.property ?? ''}`;
                    return leftKey.localeCompare(rightKey);
                }),
        [activeNode?.id, document?.motion?.clips],
    );
    const activeClip = useMemo(
        () =>
            selectedMotionClips.find((clip) => clip?.property === property) ??
            selectedMotionClips[0] ??
            null,
        [property, selectedMotionClips],
    );
    const timelineActive = Boolean(activeNode?.id);
    const [activeKeyframeId, setActiveKeyframeId] = useState(null);
    const activeKeyframe = useMemo(
        () =>
            (activeClip?.keyframes ?? []).find((keyframe) => keyframe?.id === activeKeyframeId) ??
            activeClip?.keyframes?.[activeClip.keyframes.length - 1] ??
            null,
        [activeClip?.keyframes, activeKeyframeId],
    );

    useEffect(() => {
        setActiveKeyframeId(activeClip?.keyframes?.[activeClip.keyframes.length - 1]?.id ?? null);
    }, [activeClip?.id, property]);

    useEffect(() => {
        if (!activeKeyframe) return;
        setValue(String(activeKeyframe?.v ?? getDefaultValue(property, activeNode)));
        setEasing(activeKeyframe?.easing ?? 'linear');
        setTargetTime(String(activeKeyframe?.t ?? frameTime ?? 0));
    }, [activeKeyframe, activeNode, frameTime, property]);

    function handleCreateKeyframe() {
        if (!activeNode?.id) return;

        const nextValue = Number(value);
        if (!Number.isFinite(nextValue)) return;

        timelineIntentKeyframeCreate({
            nodeId: activeNode.id,
            property,
            timeMs: frameTime,
            value: nextValue,
            easing,
            source: 'uiux.transition.timeline',
        });
    }

    function handleSeek(nextTime) {
        const time = Math.max(0, Math.min(duration, Number(nextTime) || 0));
        timelineIntentClockSeek({ time });
    }

    function handleUpdateKeyframe(patch) {
        if (!activeClip?.id || !activeKeyframe?.id) return;

        motionIntentKeyframeUpdate({
            clipId: activeClip.id,
            keyframeId: activeKeyframe.id,
            patch,
        });
    }

    function handleDeleteKeyframe() {
        if (!activeClip?.id || !activeKeyframe?.id) return;

        motionIntentKeyframeDelete({
            clipId: activeClip.id,
            keyframeId: activeKeyframe.id,
        });
        setActiveKeyframeId(null);
    }

    return (
        <div
            className={`uiux-transition-timeline ${timelineActive ? 'is-active' : 'is-inactive'}`}
            data-testid='uiux-transition-timeline'
            data-state={timelineActive ? 'active' : 'inactive'}>
            <div className='uiux-transition-timeline__summary'>
                <strong>Transition Timeline</strong>
                <span className='inspector-subtle'>
                    {activeNode?.id ? `Target: ${activeNode.id}` : 'Select a node to author motion'}
                </span>
            </div>

            {timelineActive ? (
                <>
                    <div className='uiux-transition-timeline__transport'>
                        <button
                            type='button'
                            onClick={() => (playback?.isPlaying ? timelineIntentClockPause() : timelineIntentClockPlay())}
                        >
                            {playback?.isPlaying ? 'Pause' : 'Play'}
                        </button>

                        <label className='uiux-transition-timeline__time'>
                            <span className='inspector-subtle'>Time</span>
                            <input
                                type='range'
                                min='0'
                                max={duration}
                                step='1'
                                value={Math.max(0, Math.min(duration, frameTime))}
                                onChange={(event) => handleSeek(event.target.value)}
                            />
                            <input
                                type='number'
                                min='0'
                                max={duration}
                                step='1'
                                value={targetTime}
                                onChange={(event) => setTargetTime(event.target.value)}
                                data-testid='uiux-transition-time-input'
                            />
                            <span data-testid='uiux-transition-frame-time'>{frameTime}ms</span>
                        </label>
                    </div>

                    <div className='uiux-transition-timeline__authoring'>
                        <label>
                            <span className='inspector-subtle'>Property</span>
                            <select
                                value={property}
                                onChange={(event) => {
                                    const nextProperty = event.target.value;
                                    setProperty(nextProperty);
                                    setValue(String(getDefaultValue(nextProperty, activeNode)));
                                }}
                            >
                                <option value='opacity'>Opacity</option>
                                <option value='translateY'>Translate Y</option>
                            </select>
                        </label>

                        <label>
                            <span className='inspector-subtle'>Value</span>
                            <input
                                type='number'
                                step='0.1'
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                            />
                        </label>

                        <label>
                            <span className='inspector-subtle'>Easing</span>
                            <select value={easing} onChange={(event) => setEasing(event.target.value)}>
                                <option value='linear'>Linear</option>
                                <option value='ease-in-out'>Ease In Out</option>
                            </select>
                        </label>

                        <button
                            type='button'
                            data-testid='uiux-transition-add-keyframe'
                            onClick={handleCreateKeyframe}
                            disabled={!activeNode?.id}
                        >
                            Add Keyframe
                        </button>

                        <button
                            type='button'
                            data-testid='uiux-transition-update-keyframe'
                            onClick={() =>
                                handleUpdateKeyframe({
                                    value: Number(value),
                                    easing,
                                })
                            }
                            disabled={!activeKeyframe?.id}
                        >
                            Update Keyframe
                        </button>

                        <button
                            type='button'
                            data-testid='uiux-transition-move-keyframe'
                            onClick={() =>
                                handleUpdateKeyframe({
                                    time: Number(targetTime),
                                })
                            }
                            disabled={!activeKeyframe?.id}
                        >
                            Move To Time
                        </button>

                        <button
                            type='button'
                            data-testid='uiux-transition-delete-keyframe'
                            onClick={handleDeleteKeyframe}
                            disabled={!activeKeyframe?.id}
                        >
                            Delete Keyframe
                        </button>
                    </div>

                    <div className='uiux-transition-timeline__clips' data-testid='uiux-transition-clip-count'>
                        {selectedMotionClips.length} selected clips
                    </div>

                    <div className='uiux-transition-timeline__keyframes' data-testid='uiux-transition-keyframe-count'>
                        {(activeClip?.keyframes ?? []).map((keyframe) => {
                            const isActive = keyframe?.id === activeKeyframe?.id;
                            return (
                                <button
                                    key={keyframe.id}
                                    type='button'
                                    className={`uiux-transition-timeline__keyframe ${isActive ? 'is-active' : ''}`}
                                    data-testid={`uiux-keyframe-${keyframe.id}`}
                                    onClick={() => {
                                        setActiveKeyframeId(keyframe.id);
                                        setValue(String(keyframe?.v ?? 0));
                                        setEasing(keyframe?.easing ?? 'linear');
                                        setTargetTime(String(keyframe?.t ?? 0));
                                    }}
                                >
                                    <strong>{keyframe.t}ms</strong>
                                    <span>{keyframe.v}</span>
                                </button>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className='uiux-transition-timeline__inactive' data-testid='uiux-transition-timeline-inactive'>
                    Motion tools appear when a motion-capable node is active.
                </div>
            )}
        </div>
    );
}
