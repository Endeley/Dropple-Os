import { uxCanvasPolicy } from './uxCanvasPolicy';

/**
 * UX Viewport Adapter
 * -------------------
 * Adapts viewport behavior based on UX policy.
 * NO engine calls. NO side effects.
 */
export function useUXViewport() {
    const { viewport, canvas } = uxCanvasPolicy;

    return {
        infinite: canvas.infinite,

        panEnabled: viewport.pan,
        zoomEnabled: viewport.zoom,

        minZoom: viewport.minZoom,
        maxZoom: viewport.maxZoom,

        centerOnLoad: viewport.centerOnLoad,
    };
}
