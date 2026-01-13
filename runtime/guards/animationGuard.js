import { EventTypes } from '@/core/events/eventTypes.js';
import { AnimationProperties } from '@/core/animation/AnimationSchema.js';
import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy.js';
import { getActiveWorkspace } from '../state/workspaceState.js';
import { getRuntimeState } from '../state/runtimeState.js';

const animationEventTypes = new Set([
    EventTypes.ANIMATION_CLIP_CREATE,
    EventTypes.ANIMATION_CLIP_UPDATE,
    EventTypes.ANIMATION_CLIP_DELETE,
    EventTypes.ANIMATION_TRACK_CREATE,
    EventTypes.ANIMATION_TRACK_DELETE,
    EventTypes.ANIMATION_KEYFRAME_CREATE,
    EventTypes.ANIMATION_KEYFRAME_UPDATE,
    EventTypes.ANIMATION_KEYFRAME_DELETE,
]);

/**
 * Returns null to block, or the event to allow.
 */
export function applyAnimationGuard(event) {
    if (!animationEventTypes.has(event?.type)) return event;

    const workspaceId = getActiveWorkspace();
    const policy = resolveWorkspacePolicy(workspaceId);
    if (policy?.readonly) {
        console.warn('[AnimationGuard] Blocked animation edit in readonly workspace', event?.type);
        return null;
    }

    const timelineCapability = policy?.timeline || {};
    if (timelineCapability.readOnly) {
        console.warn('[AnimationGuard] Blocked animation edit in read-only timeline', event?.type);
        return null;
    }

    const state = getRuntimeState();
    const animations = state?.timeline?.animations || {};
    const { clips = {}, tracks = {}, keyframes = {} } = animations;

    if (event.type === EventTypes.ANIMATION_TRACK_CREATE) {
        const { track } = event.payload || {};
        if (!track?.clipId || !clips[track.clipId]) {
            console.warn('[AnimationGuard] Blocked track without clip', track?.id);
            return null;
        }

        if (!AnimationProperties.includes(track.property)) {
            console.warn('[AnimationGuard] Blocked unsupported property', track?.property);
            return null;
        }

        if (Array.isArray(timelineCapability.allowedProperties) && timelineCapability.allowedProperties.length) {
            if (!timelineCapability.allowedProperties.includes(track.property)) {
                console.warn('[AnimationGuard] Blocked property not allowed in workspace', track?.property);
                return null;
            }
        }
    }

    if (event.type === EventTypes.ANIMATION_KEYFRAME_CREATE) {
        const { keyframe } = event.payload || {};
        if (!keyframe?.trackId || !tracks[keyframe.trackId]) {
            console.warn('[AnimationGuard] Blocked keyframe without track', keyframe?.id);
            return null;
        }
    }

    if (event.type === EventTypes.ANIMATION_KEYFRAME_UPDATE) {
        const { keyframeId } = event.payload || {};
        if (!keyframeId || !keyframes[keyframeId]) {
            console.warn('[AnimationGuard] Blocked keyframe update without keyframe', keyframeId);
            return null;
        }
    }

    if (event.type === EventTypes.ANIMATION_KEYFRAME_DELETE) {
        const { keyframeId } = event.payload || {};
        if (!keyframeId || !keyframes[keyframeId]) {
            console.warn('[AnimationGuard] Blocked keyframe delete without keyframe', keyframeId);
            return null;
        }
    }

    if (event.type === EventTypes.ANIMATION_CLIP_UPDATE) {
        const { clipId } = event.payload || {};
        if (!clipId || !clips[clipId]) {
            console.warn('[AnimationGuard] Blocked clip update without clip', clipId);
            return null;
        }
    }

    if (event.type === EventTypes.ANIMATION_CLIP_DELETE) {
        const { clipId } = event.payload || {};
        if (!clipId || !clips[clipId]) {
            console.warn('[AnimationGuard] Blocked clip delete without clip', clipId);
            return null;
        }
    }

    if (event.type === EventTypes.ANIMATION_TRACK_DELETE) {
        const { trackId } = event.payload || {};
        if (!trackId || !tracks[trackId]) {
            console.warn('[AnimationGuard] Blocked track delete without track', trackId);
            return null;
        }
    }

    return event;
}
