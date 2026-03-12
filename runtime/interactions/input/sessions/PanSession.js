export class PanSession {
    constructor(config = {}) {
        const { startPointer, viewport = null } = config;
        if (!startPointer) {
            throw new Error('[PanSession] startPointer required');
        }

        this.id = `pan:${startPointer.x ?? 0}:${startPointer.y ?? 0}`;
        this.type = 'pan';
        this.startPointer = startPointer;
        this.currentPointer = startPointer;
        this.viewport = viewport ?? { x: 0, y: 0, scale: 1 };
        this.delta = { dx: 0, dy: 0 };
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
            return this.delta;
        }

        this.currentPointer = { x, y };
        this.delta = {
            dx: x - this.startPointer.x,
            dy: y - this.startPointer.y,
        };
        return this.delta;
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
            kind: 'pan',
            viewport: {
                ...this.viewport,
                x: this.viewport.x + this.delta.dx,
                y: this.viewport.y + this.delta.dy,
            },
            snapGuides: [],
        };
    }

    commit() {
        return {
            type: 'viewport-pan',
            delta: {
                dx: this.delta.dx,
                dy: this.delta.dy,
            },
        };
    }

    cancel() {}
}
