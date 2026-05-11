function formatCssValue(property, value) {
    if (typeof value === 'number') {
        if (property === 'x') return `translateX(${value}px)`;
        if (property === 'y') return `translateY(${value}px)`;
        if (property === 'opacity') return value;
        return `${value}px`;
    }

    return value;
}

function sanitizeCssIdentifierPart(value) {
    return String(value ?? 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function renderLegacyCssMotionExport(blocks) {
    if (!Array.isArray(blocks) || !blocks.length) return '';

    let css = '';

    blocks.forEach((block, index) => {
        const property = Object.keys(block?.keyframes ?? {})[0] ?? null;
        if (!property) return;

        const frames = Array.isArray(block?.keyframes?.[property])
            ? block.keyframes[property]
            : [];
        if (!frames.length) return;

        const animationName = `kf_${sanitizeCssIdentifierPart(block.target)}_${sanitizeCssIdentifierPart(property)}_${index}`;
        css += `@keyframes ${animationName} {\n`;

        for (const frame of frames) {
            css += `  ${Math.round(Number(frame?.percent ?? 0))}% { ${property}: ${formatCssValue(property, frame?.value ?? null)}; }\n`;
        }

        css += `}\n\n`;
        css += `#${block.target} {\n`;
        css += `  animation: ${animationName} ${Number(block?.durationMs ?? 0)}ms linear;\n`;
        css += `}\n\n`;
    });

    return css.trim();
}

export function renderLegacyWaapiMotionExport(clips) {
    if (!Array.isArray(clips) || !clips.length) return '';

    const animations = [];

    for (const clip of clips) {
        const track = Array.isArray(clip?.tracks) ? clip.tracks[0] : null;
        if (!track?.property || !track?.nodeId) continue;

        animations.push({
            target: track.nodeId,
            property: track.property,
            duration: Number(clip?.duration ?? 0),
            keyframes: Array.isArray(track?.keyframes)
                ? track.keyframes.map((keyframe) => ({
                      offset: Number(keyframe?.offset ?? 0),
                      value: keyframe?.value ?? null,
                      easing: keyframe?.easing ?? 'linear',
                  }))
                : [],
        });
    }

    return JSON.stringify(
        {
            type: 'waapi',
            animations,
        },
        null,
        2,
    );
}
