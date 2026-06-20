'use client';

import { EventTypes } from '@/core/events/eventTypes.js';
import { createUuid } from '@/core/utils/createUuid.js';

export function getMotionClipsForNode(document, nodeId) {
    if (!nodeId) return [];

    return Object.values(document?.motion?.clips ?? {}).filter((clip) => clip?.target === nodeId);
}

export function attachMotionClipToNode(dispatch, nodeId, property = 'opacity') {
    if (!nodeId || typeof dispatch !== 'function') return;

    const clipId = `clip-${nodeId}-${property}-${createUuid().slice(0, 8)}`;
    dispatch({
        type: EventTypes.MOTION_CLIP_CREATE,
        payload: {
            clip: {
                id: clipId,
                target: nodeId,
                property,
                keyframes: [],
            },
        },
    });
}

export function removeMotionClipsFromNode(dispatch, nodeId, clips = []) {
    if (!nodeId || typeof dispatch !== 'function') return;

    clips.forEach((clip) => {
        if (!clip?.id) return;
        dispatch({
            type: EventTypes.MOTION_CLIP_DELETE,
            payload: {
                clipId: clip.id,
            },
        });
    });
}
