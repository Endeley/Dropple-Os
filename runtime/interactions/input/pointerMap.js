export class PointerMap {
    constructor() {
        this.map = new Map();
    }

    set(pointerId, value) {
        this.map.set(pointerId, value);
        return value;
    }

    get(pointerId) {
        return this.map.get(pointerId);
    }

    has(pointerId) {
        return this.map.has(pointerId);
    }

    delete(pointerId) {
        const value = this.map.get(pointerId);
        this.map.delete(pointerId);
        return value;
    }

    clear(onRemove) {
        if (onRemove) {
            for (const [id, value] of this.map.entries()) {
                onRemove(value, id);
            }
        }
        this.map.clear();
    }

    entries() {
        return this.map.entries();
    }

    values() {
        return this.map.values();
    }
}
