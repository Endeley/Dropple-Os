import { EventTypes } from '../eventTypes.js';

function ensureSequenceState(state) {
    if (state?.document?.sequences) return state;

    return {
        ...state,
        document: {
            ...state.document,
            sequences: {
                sequences: {},
                activeSequenceId: null,
            },
        },
    };
}

function updateSequenceDocument(state, patch) {
    return {
        ...state,
        document: {
            ...state.document,
            sequences: {
                ...state.document.sequences,
                ...patch,
            },
        },
    };
}

function cloneSequence(sequence) {
    return {
        ...sequence,
        tracks: { ...(sequence?.tracks || {}) },
        markers: Array.isArray(sequence?.markers) ? [...sequence.markers] : [],
    };
}

function cloneTrack(track) {
    return {
        ...track,
        clips: { ...(track?.clips || {}) },
    };
}

export function sequenceReducers(state, event) {
    const ensured = ensureSequenceState(state);
    const sequenceState = ensured.document.sequences;
    const sequences = sequenceState.sequences || {};
    const { type, payload } = event;

    switch (type) {
        case EventTypes.SEQUENCE_CREATE: {
            const sequence = payload?.sequence;
            if (!sequence?.id || sequences[sequence.id]) return state;

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequence.id]: cloneSequence(sequence),
                },
                activeSequenceId: sequenceState.activeSequenceId ?? sequence.id,
            });
        }

        case EventTypes.SEQUENCE_UPDATE: {
            const sequenceId = payload?.sequenceId;
            const patch = payload?.patch;
            if (!sequenceId || !patch || !sequences[sequenceId]) return state;

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequences[sequenceId],
                        ...patch,
                    },
                },
            });
        }

        case EventTypes.SEQUENCE_DELETE: {
            const sequenceId = payload?.sequenceId;
            if (!sequenceId || !sequences[sequenceId]) return state;

            const nextSequences = { ...sequences };
            delete nextSequences[sequenceId];

            return updateSequenceDocument(ensured, {
                sequences: nextSequences,
                activeSequenceId:
                    sequenceState.activeSequenceId === sequenceId
                        ? null
                        : sequenceState.activeSequenceId,
            });
        }

        case EventTypes.SEQUENCE_SET_ACTIVE: {
            const sequenceId = payload?.sequenceId;
            if (sequenceId != null && !sequences[sequenceId]) return state;

            return updateSequenceDocument(ensured, {
                activeSequenceId: sequenceId ?? null,
            });
        }

        case EventTypes.SEQUENCE_TRACK_CREATE: {
            const sequenceId = payload?.sequenceId;
            const track = payload?.track;
            const sequence = sequences[sequenceId];
            if (!sequenceId || !track?.id || !sequence || sequence.tracks?.[track.id]) return state;

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequence,
                        tracks: {
                            ...(sequence.tracks || {}),
                            [track.id]: cloneTrack(track),
                        },
                    },
                },
            });
        }

        case EventTypes.SEQUENCE_TRACK_UPDATE: {
            const sequenceId = payload?.sequenceId;
            const trackId = payload?.trackId;
            const patch = payload?.patch;
            const track = sequences[sequenceId]?.tracks?.[trackId];
            if (!sequenceId || !trackId || !patch || !track) return state;

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequences[sequenceId],
                        tracks: {
                            ...(sequences[sequenceId].tracks || {}),
                            [trackId]: {
                                ...track,
                                ...patch,
                            },
                        },
                    },
                },
            });
        }

        case EventTypes.SEQUENCE_TRACK_DELETE: {
            const sequenceId = payload?.sequenceId;
            const trackId = payload?.trackId;
            const track = sequences[sequenceId]?.tracks?.[trackId];
            if (!sequenceId || !trackId || !track) return state;

            const nextTracks = { ...(sequences[sequenceId].tracks || {}) };
            delete nextTracks[trackId];

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequences[sequenceId],
                        tracks: nextTracks,
                    },
                },
            });
        }

        case EventTypes.SEQUENCE_CLIP_CREATE: {
            const sequenceId = payload?.sequenceId;
            const trackId = payload?.trackId;
            const clip = payload?.clip;
            const track = sequences[sequenceId]?.tracks?.[trackId];
            if (!sequenceId || !trackId || !clip?.id || !track || track.clips?.[clip.id]) return state;

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequences[sequenceId],
                        tracks: {
                            ...(sequences[sequenceId].tracks || {}),
                            [trackId]: {
                                ...track,
                                clips: {
                                    ...(track.clips || {}),
                                    [clip.id]: { ...clip },
                                },
                            },
                        },
                    },
                },
            });
        }

        case EventTypes.SEQUENCE_CLIP_UPDATE: {
            const sequenceId = payload?.sequenceId;
            const trackId = payload?.trackId;
            const clipId = payload?.clipId;
            const patch = payload?.patch;
            const clip = sequences[sequenceId]?.tracks?.[trackId]?.clips?.[clipId];
            if (!sequenceId || !trackId || !clipId || !patch || !clip) return state;

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequences[sequenceId],
                        tracks: {
                            ...(sequences[sequenceId].tracks || {}),
                            [trackId]: {
                                ...sequences[sequenceId].tracks[trackId],
                                clips: {
                                    ...(sequences[sequenceId].tracks[trackId].clips || {}),
                                    [clipId]: {
                                        ...clip,
                                        ...patch,
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }

        case EventTypes.SEQUENCE_CLIP_DELETE: {
            const sequenceId = payload?.sequenceId;
            const trackId = payload?.trackId;
            const clipId = payload?.clipId;
            const track = sequences[sequenceId]?.tracks?.[trackId];
            if (!sequenceId || !trackId || !clipId || !track?.clips?.[clipId]) return state;

            const nextClips = { ...(track.clips || {}) };
            delete nextClips[clipId];

            return updateSequenceDocument(ensured, {
                sequences: {
                    ...sequences,
                    [sequenceId]: {
                        ...sequences[sequenceId],
                        tracks: {
                            ...(sequences[sequenceId].tracks || {}),
                            [trackId]: {
                                ...track,
                                clips: nextClips,
                            },
                        },
                    },
                },
            });
        }

        default:
            return state;
    }
}
