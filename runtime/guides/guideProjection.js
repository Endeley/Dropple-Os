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
            if (guide?.type === 'angle' && Number.isFinite(guide.angle)) {
                return { type: 'angle', angle: guide.angle };
            }
            if (
                guide?.type === 'spacing' &&
                (guide.axis === 'x' || guide.axis === 'y') &&
                Number.isFinite(guide.from) &&
                Number.isFinite(guide.to) &&
                Number.isFinite(guide.spacing)
            ) {
                return {
                    type: 'spacing',
                    axis: guide.axis,
                    from: guide.from,
                    to: guide.to,
                    spacing: guide.spacing,
                    ...(Number.isFinite(guide.x) ? { x: guide.x } : null),
                    ...(Number.isFinite(guide.y) ? { y: guide.y } : null),
                };
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
