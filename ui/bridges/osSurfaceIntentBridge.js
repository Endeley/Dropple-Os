import { routeSurfaceIntent } from '@/runtime/osSurface/routeSurfaceIntent.js';

export function dispatchOsSurfaceIntent(intent, dispatcher) {
    return routeSurfaceIntent(intent, dispatcher);
}
