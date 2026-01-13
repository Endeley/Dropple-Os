// runtime/interactions/resolveInteraction.js

export function resolveInteraction({ trigger, sourceId, runtimeState }) {
    if (!runtimeState?.interactions) return null;

    // 1. Component-scope interactions
    if (sourceId) {
        const list = runtimeState.interactions.component?.[sourceId] || [];
        const match = list.find((i) => i.trigger === trigger);
        if (match) return match;
    }

    // 2. Page-scope interactions
    const pageList = runtimeState.interactions.page || [];
    return pageList.find((i) => i.trigger === trigger) || null;
}
