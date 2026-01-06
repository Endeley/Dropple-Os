// export/waapi/exportWAAPI.js

/**
 * Export motion as Web Animations API config.
 *
 * 🔒 Deterministic
 * 🔒 Read-only
 */
export function exportWAAPI(state) {
    if (!state?.timeline) return '';

    const timelines = state.timeline.timelines ?? {};
    const timeline = timelines.default;
    if (!timeline) return '';

    const animations = [];

    for (const track of timeline.tracks ?? []) {
        for (const clip of track.clips ?? []) {
            const keyframes = clip.keyframes ?? [];
            if (keyframes.length === 0) continue;

            animations.push({
                target: track.target,
                property: track.property,
                duration: timeline.duration,
                keyframes: keyframes.map((kf) => ({
                    offset: timeline.duration > 0 ? kf.time / timeline.duration : 0,
                    value: kf.value,
                    easing: kf.easing ?? 'linear',
                })),
            });
        }
    }

    return JSON.stringify(
        {
            type: 'waapi',
            animations,
        },
        null,
        2
    );
}
