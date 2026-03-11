import { SNAP_DISTANCE } from '@/runtime/snapping/snapConstants.js';

export function computeGuides(bounds, targets) {
    if (!bounds || !Array.isArray(targets) || targets.length === 0) {
        return [];
    }

    const guides = [];
    const xs = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
    const ys = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];

    for (const target of targets) {
        if (target.type === 'v' && xs.some((x) => Math.abs(x - target.x) < SNAP_DISTANCE)) {
            guides.push({ type: 'vertical', x: target.x });
        }

        if (target.type === 'h' && ys.some((y) => Math.abs(y - target.y) < SNAP_DISTANCE)) {
            guides.push({ type: 'horizontal', y: target.y });
        }
    }

    return guides;
}
