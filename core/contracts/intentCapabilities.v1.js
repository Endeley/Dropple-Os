import { EventTypes } from '@/core/events/eventTypes.js';

export const INTENT_CAPS = {
  // node
  [EventTypes.NODE_CREATE]: ['node:create'],
  [EventTypes.NODE_UPDATE]: ['node:mutate'],
  [EventTypes.NODE_DELETE]: ['node:delete'],
  [EventTypes.LAYOUT_CONVERT]: ['node:create'],

  // behavior authoring (v1)
  [EventTypes.BEHAVIOR_STATE_CREATE]: ['node:mutate'],
  [EventTypes.BEHAVIOR_STATE_UPDATE]: ['node:mutate'],
  [EventTypes.BEHAVIOR_STATE_DELETE]: ['node:mutate'],

  // timeline / animation
  [EventTypes.TIMELINE_KEYFRAME_ADD]: ['timeline:edit'],
  [EventTypes.TIMELINE_KEYFRAME_MOVE]: ['timeline:edit'],
  [EventTypes.TIMELINE_EVENT_ADD]: ['timeline:edit'],

  [EventTypes.ANIMATION_TRACK_CREATE]: ['timeline:edit'],
  [EventTypes.ANIMATION_TRACK_DELETE]: ['timeline:edit'],
  [EventTypes.ANIMATION_KEYFRAME_ADD]: ['keyframe:create'],
  [EventTypes.ANIMATION_KEYFRAME_UPDATE]: ['keyframe:mutate'],
  [EventTypes.ANIMATION_KEYFRAME_DELETE]: ['keyframe:mutate'],
};
