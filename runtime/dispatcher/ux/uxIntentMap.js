import { EventTypes } from '@/core/events/eventTypes.js';

export const UXIntent = Object.freeze({
    SAFE: 'safe',
    SOFT_UNSAFE: 'soft-unsafe',
    HARD_UNSAFE: 'hard-unsafe',
});

export const defaultUXIntent = UXIntent.HARD_UNSAFE;

export const uxIntentMap = Object.freeze({
    [EventTypes.SELECTION_SET]: UXIntent.SAFE,
    [EventTypes.STATE_SET]: UXIntent.SOFT_UNSAFE,
    [EventTypes.COMPONENT_SET_ACTIVE]: UXIntent.SOFT_UNSAFE,
    ['interaction/execute']: UXIntent.SAFE,

    [EventTypes.NODE_CREATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_UPDATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_DELETE]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_ATTACH]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_DETACH]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_REORDER]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_MOVE]: UXIntent.HARD_UNSAFE,
    [EventTypes.NODE_RESIZE]: UXIntent.HARD_UNSAFE,

    [EventTypes.TIMELINE_KEYFRAME_ADD]: UXIntent.HARD_UNSAFE,
    [EventTypes.TIMELINE_KEYFRAME_MOVE]: UXIntent.HARD_UNSAFE,
    [EventTypes.TIMELINE_EVENT_ADD]: UXIntent.HARD_UNSAFE,

    [EventTypes.ANIMATION_TRACK_CREATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.ANIMATION_TRACK_DELETE]: UXIntent.HARD_UNSAFE,
    [EventTypes.ANIMATION_KEYFRAME_ADD]: UXIntent.HARD_UNSAFE,
    [EventTypes.ANIMATION_KEYFRAME_UPDATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.ANIMATION_KEYFRAME_DELETE]: UXIntent.HARD_UNSAFE,

    [EventTypes.TRANSITION_CREATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.TRANSITION_UPDATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.TRANSITION_DELETE]: UXIntent.HARD_UNSAFE,

    [EventTypes.INTERACTION_CREATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.INTERACTION_UPDATE]: UXIntent.HARD_UNSAFE,
    [EventTypes.INTERACTION_DELETE]: UXIntent.HARD_UNSAFE,
});
