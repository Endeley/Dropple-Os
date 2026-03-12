import { clampZoom } from '@/core/viewport/cameraPolicy.js';

const ZOOM_SENSITIVITY = 0.01;

export class ZoomSession {
    constructor(config = {}) {
        const { startPointer, viewport = null } = config;
        if (!startPointer) {
            throw new Error('[ZoomSession] startPointer required');
        }

        this.id = `zoom:${startPointer.x ?? 0}:${startPointer.y ?? 0}`;
        this.type = 'zoom';
        this.startPointer = startPointer;
        this.currentPointer = startPointer;
        this.viewport = viewport ?? { x: 0, y: 0, scale: 1 };
        this.scale = 1;
    }

    onBegin(payload) {
        if (payload?.startPointer) {
            this.startPointer = payload.startPointer;
            this.currentPointer = payload.startPointer;
        }
        if (payload?.viewport) {
            this.viewport = payload.viewport;
        }
    }

    start(event) {
        this.onBegin(event);
    }

    update(pointer) {
        const x = pointer?.x ?? pointer?.clientX;
        const y = pointer?.y ?? pointer?.clientY;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return { scale: this.scale };
        }

        this.currentPointer = { x, y };
        const dy = y - this.startPointer.y;
        this.scale = clampZoom(1 - dy * ZOOM_SENSITIVITY) / (this.viewport.scale || 1);
        return { scale: this.scale };
    }

    onPointerMove(pointer) {
        return this.update(pointer);
    }

    onPointerUp(pointer) {
        if (pointer?.x != null && pointer?.y != null) {
            this.update(pointer);
        }
    }

    getPreview() {
        return {
            kind: 'zoom',
            viewport: {
                ...this.viewport,
                scale: clampZoom((this.viewport.scale || 1) * this.scale),
            },
            snapGuides: [],
        };
    }

    commit() {
        return {
            type: 'viewport-zoom',
            scale: this.scale,
            anchor: this.startPointer,
        };
    }

    cancel() {}
}
