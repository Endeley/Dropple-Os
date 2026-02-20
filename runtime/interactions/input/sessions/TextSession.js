export class TextSession {
    constructor(pointerId, options = {}) {
        this.pointerId = pointerId;
        this.options = options;
        this.anchor = null;
        this.value = options.initialText ?? '';
    }

    start(event) {
        this.anchor = { x: event.clientX, y: event.clientY };
        this.options.onStart?.(this.anchor, event);
    }

    update(event) {
        if (!this.anchor) {
            this.start(event);
            return;
        }
        this.options.onMove?.(this.anchor, event);
    }

    setText(value) {
        this.value = value;
        this.options.onChange?.(value);
    }

    commit() {
        const result = { text: this.value, anchor: this.anchor };
        this.options.onCommit?.(this.value, this.anchor);
        this.anchor = null;
        return result;
    }

    cancel() {
        this.options.onCancel?.();
        this.anchor = null;
    }

    getPreview() {
        return { text: this.value, anchor: this.anchor };
    }
}
