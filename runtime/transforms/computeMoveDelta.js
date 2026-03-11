import { computeAlignmentGuides } from '@/runtime/snapping/computeAlignmentGuides.js';
import { computeGridSnap } from '@/runtime/snapping/computeGridSnap.js';
import { computeSnapDelta } from '@/runtime/snapping/computeSnapDelta.js';

export function computeMoveDelta(
    startPointer,
    pointer,
    bounds = null,
    targets = [],
    options = {},
) {
    if (!startPointer || !pointer) {
        return { dx: 0, dy: 0, guides: [] };
    }

    const raw = {
        dx: pointer.x - startPointer.x,
        dy: pointer.y - startPointer.y,
    };
    const movedBounds = bounds
        ? {
              x: bounds.x + raw.dx,
              y: bounds.y + raw.dy,
              width: bounds.width,
              height: bounds.height,
          }
        : null;
    const snap = computeSnapDelta(movedBounds, targets);
    const snapped = {
        dx: raw.dx + snap.snapX,
        dy: raw.dy + snap.snapY,
    };
    const finalDelta =
        options?.snapToGrid && snap.snapX === 0 && snap.snapY === 0
            ? { ...computeGridSnap(snapped), guides: [] }
            : {
                  ...snapped,
                  guides: computeAlignmentGuides(
                      movedBounds
                          ? {
                                ...movedBounds,
                                x: movedBounds.x + snap.snapX,
                                y: movedBounds.y + snap.snapY,
                            }
                          : null,
                      targets,
                  ),
              };

    return finalDelta;
}
