import { hitTestPoint } from './hitTestPoint.js';
import { hitTestBounds } from './hitTestBounds.js';

export function resolveHitTest({ runtime, type, payload }) {
    if (type === 'point') {
        return hitTestPoint({
            runtime,
            x: payload?.x,
            y: payload?.y,
        });
    }

    if (type === 'bounds') {
        return hitTestBounds({
            runtime,
            rect: payload?.rect,
        });
    }

    return null;
}
