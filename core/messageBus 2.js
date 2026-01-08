// Simple pub/sub message bus for UI-layer coordination.
export class MessageBus {
    constructor() {
        this.listeners = new Map();
    }

    on(type, handler) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type).add(handler);
    }

    off(type, handler) {
        const set = this.listeners.get(type);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) {
            this.listeners.delete(type);
        }
    }

    emit(type, payload) {
        const set = this.listeners.get(type);
        if (!set) return;
        // copy to avoid mutation during emit
        [...set].forEach((handler) => handler(payload));
    }
}
