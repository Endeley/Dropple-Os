/**
 * Exports a single Animation IR entry to Web Animations API config.
 * Pure data: caller is responsible for applying to elements.
 */
export function exportWebAnimation(ir, { duration }) {
    const keyframes = (ir.keyframes || []).map((k) => {
        const offset = duration ? (k.time / duration) : 0;
        return {
            offset: offset,
            [ir.property]: normalizeValue(ir.property, k.value),
            easing: mapEasing(k.easing),
        };
    });

    return {
        target: ir.target,
        keyframes,
        options: {
            duration: duration ?? 0,
            fill: 'forwards',
            easing: 'linear',
        },
    };
}

function normalizeValue(prop, value) {
    if (prop === 'x' || prop === 'y') {
        return `${value}px`;
    }
    return value;
}

function mapEasing(easing) {
    switch (easing) {
        case 'ease-in':
            return 'ease-in';
        case 'ease-out':
            return 'ease-out';
        case 'ease-in-out':
            return 'ease-in-out';
        default:
            return 'linear';
    }
}
