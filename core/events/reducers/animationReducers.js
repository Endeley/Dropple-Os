import { EventTypes } from "../eventTypes.js";

function ensureAnimationState(state) {
  if (state.timeline?.animations) return state;

  return {
    ...state,
    timeline: {
      ...(state.timeline || {}),
      animations: {
        clips: {},
        tracks: {},
        keyframes: {},
      },
    },
  };
}

export function animationReducers(state, event) {
  const { type, payload } = event;

  switch (type) {
    // Clips
    case EventTypes.ANIMATION_CLIP_CREATE: {
      const { clip } = payload || {};
      if (!clip?.id) return state;

      state = ensureAnimationState(state);

      if (state.timeline.animations.clips[clip.id]) return state;

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            clips: {
              ...state.timeline.animations.clips,
              [clip.id]: clip,
            },
          },
        },
      };
    }

    case EventTypes.ANIMATION_CLIP_UPDATE: {
      const { clipId, patch } = payload || {};
      if (!clipId || !patch) return state;

      const clip = state.timeline?.animations?.clips?.[clipId];
      if (!clip) return state;

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            clips: {
              ...state.timeline.animations.clips,
              [clipId]: { ...clip, ...patch },
            },
          },
        },
      };
    }

    case EventTypes.ANIMATION_CLIP_DELETE: {
      const { clipId } = payload || {};
      if (!clipId) return state;

      const { [clipId]: _, ...rest } =
        state.timeline?.animations?.clips || {};

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            clips: rest,
          },
        },
      };
    }

    // Tracks
    case EventTypes.ANIMATION_TRACK_CREATE: {
      const { track } = payload || {};
      if (!track?.id) return state;

      state = ensureAnimationState(state);

      if (state.timeline.animations.tracks[track.id]) return state;

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            tracks: {
              ...state.timeline.animations.tracks,
              [track.id]: track,
            },
          },
        },
      };
    }

    case EventTypes.ANIMATION_TRACK_DELETE: {
      const { trackId } = payload || {};
      if (!trackId) return state;

      const { [trackId]: _, ...rest } =
        state.timeline?.animations?.tracks || {};

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            tracks: rest,
          },
        },
      };
    }

    // Keyframes
    case EventTypes.ANIMATION_KEYFRAME_CREATE: {
      const { keyframe } = payload || {};
      if (!keyframe?.id) return state;

      state = ensureAnimationState(state);

      if (state.timeline.animations.keyframes[keyframe.id]) return state;

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            keyframes: {
              ...state.timeline.animations.keyframes,
              [keyframe.id]: keyframe,
            },
          },
        },
      };
    }

    case EventTypes.ANIMATION_KEYFRAME_UPDATE: {
      const { keyframeId, patch } = payload || {};
      if (!keyframeId || !patch) return state;

      const keyframe = state.timeline?.animations?.keyframes?.[keyframeId];
      if (!keyframe) return state;

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            keyframes: {
              ...state.timeline.animations.keyframes,
              [keyframeId]: { ...keyframe, ...patch },
            },
          },
        },
      };
    }

    case EventTypes.ANIMATION_KEYFRAME_DELETE: {
      const { keyframeId } = payload || {};
      if (!keyframeId) return state;

      const { [keyframeId]: _, ...rest } =
        state.timeline?.animations?.keyframes || {};

      return {
        ...state,
        timeline: {
          ...state.timeline,
          animations: {
            ...state.timeline.animations,
            keyframes: rest,
          },
        },
      };
    }

    default:
      return state;
  }
}
