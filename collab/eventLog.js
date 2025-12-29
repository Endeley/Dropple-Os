export function createEventLog() {
    const events = new Map(); // id → event

    function add(event) {
        if (events.has(event.id)) return;
        events.set(event.id, event);
    }

    function values() {
        return Array.from(events.values());
    }

    return { add, values };
}
