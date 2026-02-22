import { EventTypes } from '@/core/events/eventTypes.js';

export function resolveBehaviorTrigger({ entityId, triggerType, world }) {
    const graph = world.behaviors?.[entityId];
    if (!graph) return null;

    const runtime = world.behaviorRuntime?.[entityId];
    const currentStateId = runtime?.currentStateId ?? graph.baseStateId;

    const match = graph.triggers?.find(
        (t) => t.triggerType === triggerType && t.fromStateId === currentStateId,
    );

    if (!match) return null;

    return {
        type: EventTypes.BEHAVIOR_STATE_COMMIT,
        payload: {
            entityId,
            targetStateId: match.toStateId,
        },
    };
}
