// export/css/exportCSS.js

/**
 * Export motion as CSS keyframes.
 *
 * 🔒 Deterministic
 * 🔒 Read-only
 */
export function exportCSS(state) {
    const clips = Object.values(state?.document?.motion?.clips ?? {});
    if (!clips.length) return '';

    let css = '';
    let keyframeIndex = 0;

    for (const clip of clips) {
        const keyframes = (clip.keyframes || []).slice().sort((a, b) => a.t - b.t);
        if (keyframes.length === 0) continue;

        const duration = keyframes[keyframes.length - 1]?.t ?? 0;
        const name = `kf_${clip.target}_${clip.property}_${keyframeIndex++}`;

        css += `@keyframes ${name} {\n`;

        for (const keyframe of keyframes) {
            const pct = duration > 0 ? Math.round((keyframe.t / duration) * 100) : 0;
            css += `  ${pct}% { ${clip.property}: ${formatValue(clip.property, keyframe.v)}; }\n`;
        }

        css += `}\n\n`;

        css += `#${clip.target} {\n`;
        css += `  animation: ${name} ${duration}ms linear;\n`;
        css += `}\n\n`;
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
