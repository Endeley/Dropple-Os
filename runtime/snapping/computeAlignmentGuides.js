import { SNAP_DISTANCE } from './snapConstants.js';

export function computeAlignmentGuides(bounds, targets) {
    if (!bounds || !Array.isArray(targets) || targets.length === 0) return [];

    const xs = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
    const ys = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];
    const guides = [];

    for (const target of targets) {
        if (target.type === 'v') {
            if (xs.some((x) => Math.abs(x - target.x) < SNAP_DISTANCE)) {
                guides.push({ type: 'v', x: target.x });
            }
        }

        if (target.type === 'h') {
            if (ys.some((y) => Math.abs(y - target.y) < SNAP_DISTANCE)) {
                guides.push({ type: 'h', y: target.y });
            }
        }
    }

    return guides;
}
