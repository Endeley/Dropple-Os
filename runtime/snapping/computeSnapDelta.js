import { SNAP_DISTANCE } from './snapConstants.js';

function nearestDelta(values, targets, key) {
    let nearest = 0;
    let distance = SNAP_DISTANCE + 1;

    for (const value of values) {
        for (const target of targets) {
            const delta = target[key] - value;
            const abs = Math.abs(delta);
            if (abs < distance && abs < SNAP_DISTANCE) {
                distance = abs;
                nearest = delta;
            }
        }
    }

    return nearest;
}

export function computeSnapDelta(bounds, targets) {
    if (!bounds || !Array.isArray(targets) || targets.length === 0) {
        return { snapX: 0, snapY: 0 };
    }

    const verticalTargets = targets.filter((target) => target.type === 'v');
    const horizontalTargets = targets.filter((target) => target.type === 'h');

    const xs = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
    const ys = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

    return {
        snapX: nearestDelta(xs, verticalTargets, 'x'),
        snapY: nearestDelta(ys, horizontalTargets, 'y'),
    };
}
