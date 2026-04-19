// core/events/reducers/timelineReducers.js

import { EventTypes } from '../eventTypes.js';
import { createTrack } from '@/domain/timeline/TrackContract.js';
import { normalizeTimeline } from '@/domain/timeline/TimelineContract.js';

/**
 * Timeline reducers
 *
 * 🔒 Rules:
 * - Pure functions
 * - No ID generation (IDs must be provided by events)
 * - Deterministic updates only
 */
export function timelineReducers(state, event) {
    const { type, payload } = event;

    switch (type) {
        case EventTypes.TIMELINE_TRACK_CREATE: {
            const { id, type: trackType = 'standard' } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;
            if (Array.isArray(timeline.tracks) && timeline.tracks.some((track) => track.id === id)) {
                return state;
            }

            const nextTrack = createTrack({
                id,
                type: trackType,
                order: Array.isArray(timeline.tracks) ? timeline.tracks.length : 0,
                channelIds: [],
            });

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: [...(timeline.tracks || []), nextTrack],
                groups: timeline.groups || [],
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_TRACK_DELETE: {
            const { id } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const targetTrack = existingTracks.find((track) => track.id === id) ?? null;
            if (!targetTrack) return state;
            if (targetTrack.meta?.locked) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            if (existingGroups.some((group) => group.meta?.locked && group.trackIds?.includes(id))) {
                return state;
            }

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: existingTracks.filter((track) => track.id !== id),
                groups: existingGroups.map((group) => ({
                    ...group,
                    trackIds: Array.isArray(group.trackIds)
                        ? group.trackIds.filter((trackId) => trackId !== id)
                        : [],
                })),
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_TRACK_REORDER: {
            const { id, toIndex } = payload || {};
            if (!id || typeof id !== 'string' || !Number.isInteger(toIndex)) return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const fromIndex = existingTracks.findIndex((track) => track.id === id);
            if (fromIndex === -1) return state;

            const targetTrack = existingTracks[fromIndex];
            if (targetTrack?.meta?.locked) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            if (existingGroups.some((group) => group.meta?.locked)) return state;
            if (existingTracks.some((track) => track.meta?.locked)) return state;
            if (existingGroups.some((group) => group.trackIds?.includes(id) && group.meta?.locked)) {
                return state;
            }

            const clampedIndex = Math.max(0, Math.min(toIndex, existingTracks.length - 1));
            if (clampedIndex === fromIndex) return state;

            const nextTracks = [...existingTracks];
            const [moved] = nextTracks.splice(fromIndex, 1);
            nextTracks.splice(clampedIndex, 0, moved);
            const orderedTracks = nextTracks.map((track, index) => ({
                ...track,
                order: index,
            }));

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: orderedTracks,
                groups: existingGroups,
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_TRACK_CHANNEL_ASSIGN: {
            const { trackId, channelId } = payload || {};
            if (
                !trackId ||
                !channelId ||
                typeof trackId !== 'string' ||
                typeof channelId !== 'string'
            ) {
                return state;
            }

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const targetTrack = existingTracks.find((track) => track.id === trackId) ?? null;
            if (!targetTrack) return state;
            if (targetTrack.meta?.locked) return state;

            const sourceTrack =
                existingTracks.find(
                    (track) => Array.isArray(track.channelIds) && track.channelIds.includes(channelId)
                ) ?? null;
            if (sourceTrack?.meta?.locked) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const targetGroup = existingGroups.find((group) => group.trackIds?.includes(trackId)) ?? null;
            if (targetGroup?.meta?.locked) return state;
            const sourceGroup = sourceTrack
                ? existingGroups.find((group) => group.trackIds?.includes(sourceTrack.id)) ?? null
                : null;
            if (sourceGroup?.meta?.locked) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: existingTracks.map((track) => {
                    const baseChannelIds = Array.isArray(track.channelIds) ? track.channelIds : [];
                    const withoutChannel = baseChannelIds.filter((id) => id !== channelId);
                    if (track.id !== trackId) {
                        return {
                            ...track,
                            channelIds: withoutChannel,
                        };
                    }
                    return {
                        ...track,
                        channelIds: [...withoutChannel, channelId],
                    };
                }),
                groups: existingGroups,
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_TRACK_LOCK_TOGGLE: {
            const { id } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const targetTrack = existingTracks.find((track) => track.id === id) ?? null;
            if (!targetTrack) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const containingGroup = existingGroups.find((group) => group.trackIds?.includes(id)) ?? null;
            if (containingGroup?.meta?.locked) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: existingTracks.map((track) =>
                    track.id === id
                        ? {
                              ...track,
                              meta: {
                                  ...(track.meta || {}),
                                  locked: !track.meta?.locked,
                              },
                          }
                        : track
                ),
                groups: existingGroups,
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_TRACK_BLEND_MODE_SET: {
            const { id, blendMode } = payload || {};
            if (!id || !blendMode || typeof id !== 'string' || typeof blendMode !== 'string') {
                return state;
            }

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const targetTrack = existingTracks.find((track) => track.id === id) ?? null;
            if (!targetTrack) return state;
            if (targetTrack.meta?.locked) return state;
            if (targetTrack.type === 'overlay') return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const containingGroup = existingGroups.find((group) => group.trackIds?.includes(id)) ?? null;
            if (containingGroup?.meta?.locked) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: existingTracks.map((track) =>
                    track.id === id
                        ? {
                              ...track,
                              meta: {
                                  ...(track.meta || {}),
                                  blendMode,
                              },
                          }
                        : track
                ),
                groups: existingGroups,
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_GROUP_CREATE: {
            const { id } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            if (existingGroups.some((group) => group.id === id)) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: Array.isArray(timeline.tracks) ? timeline.tracks : [],
                groups: [
                    ...existingGroups,
                    {
                        id,
                        order: existingGroups.length,
                        trackIds: [],
                        meta: {},
                    },
                ],
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_GROUP_DELETE: {
            const { id } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const targetGroup = existingGroups.find((group) => group.id === id) ?? null;
            if (!targetGroup) return state;
            if (targetGroup.meta?.locked) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: Array.isArray(timeline.tracks) ? timeline.tracks : [],
                groups: existingGroups.filter((group) => group.id !== id),
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_GROUP_LOCK_TOGGLE: {
            const { id } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const targetGroup = existingGroups.find((group) => group.id === id) ?? null;
            if (!targetGroup) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: Array.isArray(timeline.tracks) ? timeline.tracks : [],
                groups: existingGroups.map((group) =>
                    group.id === id
                        ? {
                              ...group,
                              meta: {
                                  ...(group.meta || {}),
                                  locked: !group.meta?.locked,
                              },
                          }
                        : group
                ),
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_GROUP_COLLAPSE_TOGGLE: {
            const { id } = payload || {};
            if (!id || typeof id !== 'string') return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const targetGroup = existingGroups.find((group) => group.id === id) ?? null;
            if (!targetGroup) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: Array.isArray(timeline.tracks) ? timeline.tracks : [],
                groups: existingGroups.map((group) =>
                    group.id === id
                        ? {
                              ...group,
                              meta: {
                                  ...(group.meta || {}),
                                  collapsed: !group.meta?.collapsed,
                              },
                          }
                        : group
                ),
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_GROUP_TRACK_ASSIGN: {
            const { groupId, trackId } = payload || {};
            if (!groupId || !trackId || typeof groupId !== 'string' || typeof trackId !== 'string') {
                return state;
            }

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const targetTrack = existingTracks.find((track) => track.id === trackId) ?? null;
            if (!targetTrack) return state;
            if (targetTrack.meta?.locked) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const targetGroup = existingGroups.find((group) => group.id === groupId) ?? null;
            if (!targetGroup) return state;
            if (targetGroup.meta?.locked) return state;

            const sourceGroup = existingGroups.find((group) => group.trackIds?.includes(trackId)) ?? null;
            if (sourceGroup?.meta?.locked) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: existingTracks,
                groups: existingGroups.map((group) => {
                    const baseTrackIds = Array.isArray(group.trackIds) ? group.trackIds : [];
                    const withoutTrack = baseTrackIds.filter((id) => id !== trackId);
                    if (group.id !== groupId) {
                        return {
                            ...group,
                            trackIds: withoutTrack,
                        };
                    }
                    return {
                        ...group,
                        trackIds: [...withoutTrack, trackId],
                    };
                }),
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_GROUP_TRACK_UNASSIGN: {
            const { groupId, trackId } = payload || {};
            if (!groupId || !trackId || typeof groupId !== 'string' || typeof trackId !== 'string') {
                return state;
            }

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const existingTracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
            const targetTrack = existingTracks.find((track) => track.id === trackId) ?? null;
            if (!targetTrack) return state;
            if (targetTrack.meta?.locked) return state;

            const existingGroups = Array.isArray(timeline.groups) ? timeline.groups : [];
            const targetGroup = existingGroups.find((group) => group.id === groupId) ?? null;
            if (!targetGroup) return state;
            if (targetGroup.meta?.locked) return state;

            const sourceGroup = existingGroups.find((group) => group.trackIds?.includes(trackId)) ?? null;
            if (sourceGroup?.meta?.locked) return state;

            const normalized = normalizeTimeline({
                ...timeline,
                tracks: existingTracks,
                groups: existingGroups.map((group) =>
                    group.id === groupId
                        ? {
                              ...group,
                              trackIds: (Array.isArray(group.trackIds) ? group.trackIds : []).filter(
                                  (id) => id !== trackId
                              ),
                          }
                        : group
                ),
                channels: timeline.channels || [],
            });

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            ...normalized,
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_EVENT_ADD: {
            const event = payload?.event;
            if (!event) return state;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const nextEvents = [...(timeline.events || []), event];

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            events: nextEvents,
                        },
                    },
                },
            };
        }
        case EventTypes.TIMELINE_KEYFRAME_ADD: {
            const { nodeId, trackId, keyframeId, time, property, value, easing = 'linear' } = payload;

            if (!keyframeId) {
                // Hard guard — reducers must not fabricate identity
                return state;
            }

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const track = timeline.tracks.find((t) => t.id === trackId);
            if (!track) return state;

            const clip = track.clips?.[0];
            if (!clip) return state;

            const nextClip = {
                ...clip,
                keyframes: [...clip.keyframes, { id: keyframeId, time, property, value, easing }],
            };

            const nextTrack = {
                ...track,
                clips: [nextClip],
            };

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            tracks: timeline.tracks.map((t) => (t.id === trackId ? nextTrack : t)),
                        },
                    },
                },
            };
        }

        case EventTypes.TIMELINE_KEYFRAME_MOVE: {
            const { keyframeId, trackId, time } = payload;

            const timelineState = state.timeline || { timelines: {} };
            const timelines = timelineState.timelines || {};
            const timeline = timelines.default;
            if (!timeline) return state;

            const track = timeline.tracks.find((t) => t.id === trackId);
            if (!track) return state;

            const clip = track.clips?.[0];
            if (!clip) return state;

            const nextClip = {
                ...clip,
                keyframes: clip.keyframes.map((kf) => (kf.id === keyframeId ? { ...kf, time } : kf)),
            };

            const nextTrack = {
                ...track,
                clips: [nextClip],
            };

            return {
                ...state,
                timeline: {
                    ...timelineState,
                    timelines: {
                        ...timelines,
                        default: {
                            ...timeline,
                            tracks: timeline.tracks.map((t) => (t.id === trackId ? nextTrack : t)),
                        },
                    },
                },
            };
        }

        default:
            return state;
    }
}
