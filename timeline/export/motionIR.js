/**
 * Builds a Dropple motion IR from a timeline.
 * Pure: does not mutate timeline or runtime state.
 */
export function buildMotionIR(timeline) {
    if (!timeline || !timeline.tracks) return null;

    const animations = [];

    const trackList = Array.isArray(timeline.tracks)
        ? timeline.tracks
        : Object.values(timeline.tracks);

    trackList.forEach((track) => {
        const properties = track.properties || {};
        Object.entries(properties).forEach(([property, keyframes]) => {
            if (!Array.isArray(keyframes) || keyframes.length === 0) return;

            animations.push({
                target: track.nodeId || track.targetId || track.id,
                property,
                keyframes: keyframes.map((kf) => ({
                    time: kf.time,
                    value: kf.value,
                    easing: kf.easing ?? 'linear',
                })),
            });
        });
    });

    if (animations.length === 0) return null;

    return {
        type: 'motion',
        version: 1,
        duration: timeline.duration ?? 0,
        animations,
    };
}
