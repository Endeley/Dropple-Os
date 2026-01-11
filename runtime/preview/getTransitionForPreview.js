export function getTransitionForPreview({ prev, next }) {
    const { activeStateId: fromStateId, activeComponentId } = prev || {};
    const { activeStateId: toStateId } = next || {};

    // No state switch → no preview
    if (!fromStateId || !toStateId || fromStateId === toStateId) {
        return null;
    }

    const transitions = next?.transitions;
    if (!transitions) return null;

    // Component-scope transition (highest priority)
    if (activeComponentId) {
        const componentTransitions = transitions.component?.[activeComponentId];
        if (componentTransitions) {
            return (
                Object.values(componentTransitions).find(
                    (t) => t?.sourceStateId === fromStateId && t?.targetStateId === toStateId
                ) || null
            );
        }
    }

    // Page-scope transition
    return (
        Object.values(transitions.page || {}).find(
            (t) => t?.sourceStateId === fromStateId && t?.targetStateId === toStateId
        ) || null
    );
}
