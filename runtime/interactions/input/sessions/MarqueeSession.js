import { hitTestBounds } from '@/runtime/hitTest/hitTestBounds.js';

function toRect(startPointer, pointer) {
    const x = pointer?.x ?? pointer?.clientX;
    const y = pointer?.y ?? pointer?.clientY;

    return {
        x: Math.min(startPointer.x, x),
        y: Math.min(startPointer.y, y),
        width: Math.abs(x - startPointer.x),
        height: Math.abs(y - startPointer.y),
    };
}

export class MarqueeSession {
    constructor(config = {}) {
        const { startPointer, runtime = null } = config;
        if (!startPointer) {
            throw new Error('[MarqueeSession] startPointer required');
        }

        this.id = `marquee:${startPointer.x ?? 0}:${startPointer.y ?? 0}`;
        this.type = 'marquee';
        this.startPointer = startPointer;
        this.currentPointer = startPointer;
        this.runtime = runtime;
        this.rect = toRect(startPointer, startPointer);
        this.hitIds = [];
    }

    onBegin(payload) {
        if (payload?.startPointer) {
            this.startPointer = payload.startPointer;
            this.currentPointer = payload.startPointer;
            this.rect = toRect(this.startPointer, this.startPointer);
        }
    }

    start(event) {
        this.onBegin(event);
    }

    update(pointer) {
        const x = pointer?.x ?? pointer?.clientX;
        const y = pointer?.y ?? pointer?.clientY;
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            return { marquee: this.rect, ids: this.hitIds };
        }

        this.currentPointer = { x, y };
        this.rect = toRect(this.startPointer, this.currentPointer);
        this.hitIds = hitTestBounds({
            runtime: this.runtime,
            rect: this.rect,
        });

        return {
            marquee: this.rect,
            ids: this.hitIds,
        };
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
            kind: 'marquee',
            marquee: this.rect,
            nodeIds: this.hitIds,
            snapGuides: [],
        };
    }

    commit() {
        return {
            type: 'selection-set',
            ids: this.hitIds,
            primary: this.hitIds[0] ?? null,
        };
    }

    cancel() {}
}
