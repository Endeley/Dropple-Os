import { computeGuides } from './computeGuides.js';
import { computeSpacingGuides } from './computeSpacingGuides.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';

function freezeGuide(guide) {
    return Object.freeze({ ...guide });
}

export function guideProjection(runtime, selectionBounds) {
    const bounds = selectionBounds?.bounds ?? null;
    if (!bounds) {
        return Object.freeze([]);
    }

    const selectedIds = Array.from(runtime?.selection?.ids ?? []);
    const targets = computeSnapTargets(runtime?.scene?.computed ?? {}, selectedIds);
    const guides = [
        ...computeGuides(bounds, targets),
        ...computeSpacingGuides(bounds, targets),
    ];

    return Object.freeze(guides.map(freezeGuide));
}
