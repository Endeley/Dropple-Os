import { clamp } from './firstWorldCamera.js';

function getCameraRelationship(projection, focus, arrival) {
    if (arrival >= 0.7) {
        return 'foreground';
    }

    if (focus >= 0.36) {
        return projection.forward >= 0 ? 'approaching' : 'receding';
    }

    return 'distant';
}

export function projectWorldPoint(camera, worldPosition) {
    const dx = worldPosition.x - camera.x;
    const dy = worldPosition.y - camera.y;
    const dz = worldPosition.z - camera.z;
    const forward = dz;
    const lateral = dx;
    const perspectiveBase = 1320;
    const projectedDepth = Math.max(340, perspectiveBase + forward);
    const perspectiveScale = clamp(perspectiveBase / projectedDepth, 0.16, 1.72);
    const screenX = lateral * perspectiveScale;
    const screenY = dy * perspectiveScale;

    return Object.freeze({
        dx,
        dy,
        dz,
        forward,
        lateral,
        perspectiveScale,
        screenX,
        screenY,
    });
}

export function getDiscoveryMetrics(camera, worldPosition) {
    const projection = projectWorldPoint(camera, worldPosition);
    const worldDistance = Math.hypot(projection.lateral * 0.82, projection.forward);
    const normalizedDistance = clamp(worldDistance / 2600, 0, 1.3);
    const focus = clamp(1 - normalizedDistance, 0, 1);
    const arrival = clamp(1 - worldDistance / 420, 0, 1);
    const behindFactor = clamp((-projection.forward - 180) / 1400, 0, 1);

    return Object.freeze({
        focus,
        relationship: getCameraRelationship(projection, focus, arrival),
        projection,
        behindFactor,
        scale: clamp(
            projection.perspectiveScale *
                (0.9 + arrival * 0.42) *
                (1 - behindFactor * 0.08),
            0.08,
            2.05,
        ),
    });
}
