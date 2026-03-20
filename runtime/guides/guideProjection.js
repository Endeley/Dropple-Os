import { computeGuides } from './computeGuides.js';
import { computeSpacingGuides } from './computeSpacingGuides.js';
import { computeSnapTargets } from '@/runtime/snapping/computeSnapTargets.js';

function freezeGuide(guide) {
    return Object.freeze({ ...guide });
}

function projectDragGuides(runtime) {
    const drag = runtime?.interaction?.drag;
    if (!drag?.active || !Array.isArray(drag.guides) || drag.guides.length === 0) {
        return [];
    }

    return drag.guides
        .map((guide) => {
            if (guide?.type === 'vertical' && Number.isFinite(guide.x)) {
                return { type: 'vertical', x: guide.x };
            }
            if (guide?.type === 'horizontal' && Number.isFinite(guide.y)) {
                return { type: 'horizontal', y: guide.y };
            }
            return null;
        })
        .filter(Boolean);
}

export function guideProjection(runtime, selectionBounds) {
    const dragGuides = projectDragGuides(runtime);
    const bounds = selectionBounds?.bounds ?? null;
    if (!bounds) {
        return Object.freeze(dragGuides.map(freezeGuide));
    }

    const selectedIds = Array.from(runtime?.selection?.ids ?? []);
    const targets = computeSnapTargets(runtime?.scene?.computed ?? {}, selectedIds);
    const guides = [
        ...dragGuides,
        ...computeGuides(bounds, targets),
        ...computeSpacingGuides(bounds, targets),
    ];

    return Object.freeze(guides.map(freezeGuide));
}
