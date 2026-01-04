import { buildMotionIR } from './motionIR.js';
import { groupMotionFrames } from './groupMotionFrames.js';
import { composeTransform } from '../transform/composeTransform.js';

/**
 * Exports a timeline to CSS keyframes.
 * - Pure function: returns a string
 * - Does not mutate state or timeline
 */
export function exportTimelineToCSS(timeline, { selectorMap = {} } = {}) {
    const ir = buildMotionIR(timeline);
    if (!ir) return '';

    let css = '';

    ir.animations.forEach((anim, index) => {
        const name = `dropple_anim_${index}`;
        const selector = selectorMap[anim.target] || `[data-node="${anim.target}"]`;

        // Merge this property's keyframes into grouped frames
        const frames = groupMotionFrames({ [anim.property]: anim.keyframes });
        if (!frames.length) return;

        const duration = timeline?.duration ?? 0;
        const safeDuration = duration > 0 ? duration : 1;

        css += `@keyframes ${name} {\n`;

        frames.forEach((frame) => {
            const pct = Math.round((frame.time / safeDuration) * 100);
            css += `  ${pct}% {\n`;

            if (frame.values.opacity != null) {
                css += `    opacity: ${frame.values.opacity};\n`;
            }

            const transform = composeTransform(frame.values);
            if (transform) {
                css += `    transform: ${transform};\n`;
            }

            css += `  }\n`;
        });

        css += `}\n\n`;

        const easing = frames[0]?.easing;
        css += `${selector} {\n`;
        css += `  animation: ${name} ${duration || 0}ms ${easingToCSS(easing)} forwards;\n`;
        css += `}\n\n`;
    });

    return css;
}

function easingToCSS(easing) {
    if (!easing) return 'linear';
    if (easing.type === 'linear') return 'linear';
    if (easing.type === 'cubic') {
        const { x1, y1, x2, y2 } = easing;
        return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    }
    return 'linear';
}
