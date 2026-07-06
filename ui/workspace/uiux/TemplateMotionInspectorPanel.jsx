'use client';

import { useMemo } from 'react';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { RuntimeDispatchRelay } from '@/runtime/boundary/RuntimeDispatchRelay.jsx';
import {
    attachMotionClipToNode,
    getMotionClipsForNode,
    removeMotionClipsFromNode,
} from '@/ui/motion/motionClipActions.js';

function sortClips(clips = []) {
    return [...clips].sort((left, right) => {
        const leftKey = `${left?.target ?? ''}:${left?.property ?? ''}`;
        const rightKey = `${right?.target ?? ''}:${right?.property ?? ''}`;
        return leftKey.localeCompare(rightKey);
    });
}

function formatRange(keyframes = []) {
    if (!Array.isArray(keyframes) || keyframes.length === 0) {
        return '0ms';
    }

    const first = keyframes[0]?.t ?? keyframes[0]?.time ?? 0;
    const last = keyframes[keyframes.length - 1]?.t ?? keyframes[keyframes.length - 1]?.time ?? first;

    if (first === last) {
        return `${last}ms`;
    }

    return `${first}-${last}ms`;
}

function TemplateMotionInspectorActions({ hasMotionForSelectedNode = false, nodeId = null, selectedNodeClips = [] }) {
    return (
        <RuntimeDispatchRelay>
            {(dispatcher) =>
                !hasMotionForSelectedNode ? (
                    <button
                        type='button'
                        className='selection-context-menu__button'
                        data-testid='uiux-motion-attach'
                        onClick={() => attachMotionClipToNode(dispatcher?.dispatch, nodeId)}>
                        Attach Motion
                    </button>
                ) : (
                    <button
                        type='button'
                        className='selection-context-menu__button is-danger'
                        data-testid='uiux-motion-remove'
                        onClick={() => removeMotionClipsFromNode(dispatcher?.dispatch, nodeId, selectedNodeClips)}>
                        Remove Motion
                    </button>
                )
            }
        </RuntimeDispatchRelay>
    );
}

export function TemplateMotionInspectorPanel({ nodeId = null }) {
    const document = useWorkspaceProjectionState((state) => state.document ?? null);
    const timeline = useWorkspaceProjectionState((state) => state.timeline ?? null);

    const motionView = useMemo(() => {
        const allClips = sortClips(Object.values(document?.motion?.clips ?? {}));
        const channels = Array.isArray(timeline?.timelines?.default?.channels)
            ? [...timeline.timelines.default.channels]
            : [];
        const targets = [...new Set(allClips.map((clip) => clip?.target).filter(Boolean))].sort((a, b) =>
            String(a).localeCompare(String(b)),
        );
        const activeClips = nodeId
            ? allClips.filter((clip) => clip?.target === nodeId)
            : allClips;

        return {
            allClips,
            activeClips,
            channels,
            targets,
        };
    }, [document?.motion?.clips, nodeId, timeline?.timelines]);

    const selectedNodeClips = useMemo(() => getMotionClipsForNode(document, nodeId), [document, nodeId]);
    const hasMotionForSelectedNode = selectedNodeClips.length > 0;

    if (motionView.allClips.length === 0) {
        return (
            <div className='inspector-group' data-testid='uiux-motion-inspector-empty'>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Motion Runtime</div>
                <div className='inspector-subtle' style={{ fontSize: 12 }}>
                    No timeline-backed motion is installed.
                </div>
                {nodeId ? (
                    <TemplateMotionInspectorActions nodeId={nodeId} />
                ) : null}
            </div>
        );
    }

    return (
        <div className='inspector-group' data-testid='uiux-motion-inspector'>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Motion Runtime</div>

            <div className='inspector-row'>
                <span className='inspector-subtle'>Selected Node</span>
                <span data-testid='uiux-motion-inspector-selected-node'>{nodeId ?? 'None'}</span>
            </div>

            <div className='inspector-row'>
                <span className='inspector-subtle'>Total Clips</span>
                <span data-testid='uiux-motion-inspector-total-clips'>{motionView.allClips.length}</span>
            </div>

            <div className='inspector-row'>
                <span className='inspector-subtle'>Motion Targets</span>
                <span data-testid='uiux-motion-inspector-target-count'>{motionView.targets.length}</span>
            </div>

            <div className='inspector-row'>
                <span className='inspector-subtle'>Timeline Channels</span>
                <span data-testid='uiux-motion-inspector-channel-count'>{motionView.channels.length}</span>
            </div>

            <div className='inspector-row'>
                <span className='inspector-subtle'>Active Clips</span>
                <span data-testid='uiux-motion-inspector-active-clips'>{motionView.activeClips.length}</span>
            </div>

            {nodeId ? (
                <div className='inspector-row' style={{ justifyContent: 'flex-start', gap: 8 }}>
                    <TemplateMotionInspectorActions
                        hasMotionForSelectedNode={hasMotionForSelectedNode}
                        nodeId={nodeId}
                        selectedNodeClips={selectedNodeClips}
                    />
                </div>
            ) : null}

            <div className='inspector-group' style={{ gap: 8 }}>
                {motionView.activeClips.map((clip) => (
                    <div
                        key={`${clip.target}:${clip.property}`}
                        className='inspector-row'
                        style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 2 }}
                    >
                        <strong style={{ fontSize: 12 }}>{clip.target}.{clip.property}</strong>
                        <span className='inspector-subtle' style={{ fontSize: 11 }}>
                            {clip.keyframes?.length ?? 0} keyframes • {formatRange(clip.keyframes)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
