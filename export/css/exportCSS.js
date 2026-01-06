// export/css/exportCSS.js

/**
 * Export motion as CSS keyframes.
 *
 * 🔒 Deterministic
 * 🔒 Read-only
 */
export function exportCSS(state) {
    if (!state?.timeline) return '';

    const timelines = state.timeline.timelines ?? {};
    const timeline = timelines.default;
    if (!timeline) return '';

    let css = '';
    let keyframeIndex = 0;

    for (const track of timeline.tracks ?? []) {
        for (const clip of track.clips ?? []) {
            const keyframes = clip.keyframes ?? [];
            if (keyframes.length === 0) continue;

            const name = `kf_${track.target}_${track.property}_${keyframeIndex++}`;

            css += `@keyframes ${name} {\n`;

            for (const kf of keyframes) {
                const pct = timeline.duration > 0 ? Math.round((kf.time / timeline.duration) * 100) : 0;

                css += `  ${pct}% { ${track.property}: ${formatValue(track.property, kf.value)}; }\n`;
            }

            css += `}\n\n`;

            css += `#${track.target} {\n`;
            css += `  animation: ${name} ${timeline.duration}ms linear;\n`;
            css += `}\n\n`;
        }
    }

    return css.trim();
}

function formatValue(prop, value) {
    if (typeof value === 'number') {
        if (prop === 'x') return `translateX(${value}px)`;
        if (prop === 'y') return `translateY(${value}px)`;
        if (prop === 'opacity') return value;
        return `${value}px`;
    }

    return value;
}
