import { computeTransformAnchor } from './computeTransformAnchor.js';
import { computeResizeAnchors } from './computeResizeAnchors.js';
import { computeRotateAnchor } from './computeRotateAnchor.js';

function freezePoint(point) {
    return point ? Object.freeze({ ...point }) : null;
}

function freezeResizeAnchors(anchors) {
    if (!anchors) return null;

    return Object.freeze({
        n: freezePoint(anchors.n),
        ne: freezePoint(anchors.ne),
        e: freezePoint(anchors.e),
        se: freezePoint(anchors.se),
        s: freezePoint(anchors.s),
        sw: freezePoint(anchors.sw),
        w: freezePoint(anchors.w),
        nw: freezePoint(anchors.nw),
    });
}

export function transformAnchorProjection(selectionBounds) {
    const bounds = selectionBounds?.bounds ?? null;

    if (!bounds) {
        return Object.freeze({
            pivot: null,
            resizeAnchors: null,
            rotateAnchor: null,
        });
    }

    return Object.freeze({
        pivot: freezePoint(computeTransformAnchor(bounds)),
        resizeAnchors: freezeResizeAnchors(computeResizeAnchors(bounds)),
        rotateAnchor: freezePoint(computeRotateAnchor(bounds)),
    });
}
