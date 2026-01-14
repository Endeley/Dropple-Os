import { EventTypes } from '@/core/events/eventTypes.js';
import { getRuntimeState } from '../state/runtimeState.js';

const ALLOWED_ANIMATION_PROPERTIES = new Set([
    'x',
    'y',
    'opacity',
    'scale',
    'rotation',
    'width',
    'height',
]);

const animationEventTypes = new Set([
    EventTypes.ANIMATION_TRACK_CREATE,
    EventTypes.ANIMATION_TRACK_DELETE,
    EventTypes.ANIMATION_KEYFRAME_ADD,
    EventTypes.ANIMATION_KEYFRAME_UPDATE,
    EventTypes.ANIMATION_KEYFRAME_DELETE,
]);

function isSerializableValue(value) {
    if (value === undefined) return false;
    if (typeof value === 'function') return false;
    if (typeof value === 'symbol') return false;
    return true;
}

/**
 * Returns null to block, or the event to allow.
 */
export function applyAnimationGuard(event) {
    if (!animationEventTypes.has(event?.type)) return event;

    const state = getRuntimeState();
    if (!state) return event;

    const timeline = state.timeline?.timelines?.default;
    const tracks = timeline?.tracks || [];

    switch (event.type) {
        case EventTypes.ANIMATION_TRACK_CREATE: {
            const { trackId, nodeId, property } = event.payload || {};
            if (!trackId || !nodeId || !property) return null;
            if (!state.nodes?.[nodeId]) return null;
            if (!ALLOWED_ANIMATION_PROPERTIES.has(property)) return null;

            const duplicate = tracks.some((track) => track?.nodeId === nodeId && track?.property === property);
            if (duplicate) return null;

            return event;
        }

        case EventTypes.ANIMATION_TRACK_DELETE: {
            const { trackId } = event.payload || {};
            if (!trackId || !tracks.some((track) => track?.id === trackId)) return null;
            return event;
        }

        case EventTypes.ANIMATION_KEYFRAME_ADD: {
            const { trackId, keyframe } = event.payload || {};
            if (!trackId || !keyframe?.id) return null;
            if (!Number.isFinite(keyframe.time) || keyframe.time < 0) return null;
            if (!isSerializableValue(keyframe.value)) return null;

            const track = tracks.find((t) => t?.id === trackId);
            if (!track) return null;

            return event;
        }

        case EventTypes.ANIMATION_KEYFRAME_UPDATE: {
            const { trackId, keyframeId, patch } = event.payload || {};
            if (!trackId || !keyframeId || !patch) return null;
            if (Object.keys(patch).length === 0) return null;
            if ('time' in patch && (!Number.isFinite(patch.time) || patch.time < 0)) return null;
            if ('value' in patch && !isSerializableValue(patch.value)) return null;

            const track = tracks.find((t) => t?.id === trackId);
            if (!track) return null;
            const exists = track.keyframes?.some((kf) => kf.id === keyframeId);
            if (!exists) return null;

            return event;
        }

        case EventTypes.ANIMATION_KEYFRAME_DELETE: {
            const { trackId, keyframeId } = event.payload || {};
            if (!trackId || !keyframeId) return null;

            const track = tracks.find((t) => t?.id === trackId);
            if (!track) return null;
            const exists = track.keyframes?.some((kf) => kf.id === keyframeId);
            if (!exists) return null;

            return event;
        }

        default:
            return event;
    }
}
