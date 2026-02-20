export class DrawSession {
    constructor(pointerId, options = {}) {
        this.pointerId = pointerId;
        this.options = options;
        this.points = [];
    }

    start(event) {
        const startPoint = { x: event.clientX, y: event.clientY };
        this.points = [startPoint];
        this.options.onStart?.(startPoint, event);
    }

    update(event) {
        const nextPoint = { x: event.clientX, y: event.clientY };
        this.points.push(nextPoint);
        this.options.onDraw?.([...this.points], event);
    }

    commit() {
        const result = [...this.points];
        this.options.onEnd?.(result);
        this.points = [];
        return result;
    }

    cancel() {
        this.options.onCancel?.();
        this.points = [];
    }

    getPreview() {
        return [...this.points];
    }
}
