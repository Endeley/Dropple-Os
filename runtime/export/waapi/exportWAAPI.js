// export/waapi/exportWAAPI.js

/**
 * Export motion as Web Animations API config.
 *
 * 🔒 Deterministic
 * 🔒 Read-only
 */
export function exportWAAPI(state) {
    const clips = Object.values(state?.document?.motion?.clips ?? {});
    if (!clips.length) return '';

    const animations = [];

    for (const clip of clips) {
        const keyframes = (clip.keyframes || []).slice().sort((a, b) => a.t - b.t);
        if (keyframes.length === 0) continue;
        const duration = keyframes[keyframes.length - 1]?.t ?? 0;

        animations.push({
            target: clip.target,
            property: clip.property,
            duration,
            keyframes: keyframes.map((keyframe) => ({
                offset: duration > 0 ? keyframe.t / duration : 0,
                value: keyframe.v,
                easing: keyframe.easing ?? 'linear',
            })),
        });
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
