export function mergeBranch(source, target) {
    const sourceEvents = source.events || [];
    const targetEvents = target.events || [];

    const targetIds = new Set(targetEvents.map((e) => e.id));
    const newEvents = sourceEvents.filter((e) => !targetIds.has(e.id));

    target.events.push(...newEvents);
    if (newEvents.length) {
        target.head = newEvents[newEvents.length - 1].id;
    }
}
