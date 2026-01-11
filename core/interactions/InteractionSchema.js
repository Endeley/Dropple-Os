// core/interactions/InteractionSchema.js

export const InteractionTriggers = Object.freeze({
  CLICK: 'click',
  HOVER: 'hover',
  KEY_PRESS: 'key_press',
});

export const InteractionActions = Object.freeze({
  SET_STATE: 'set_state',
  SET_COMPONENT_ACTIVE: 'set_component_active',
});

/**
 * InteractionDefinition
 *
 * 🔒 Pure declarative metadata.
 * No callbacks. No logic. No execution.
 */
export function createInteraction({
  id,
  scope,              // 'component' | 'page'
  sourceId,           // componentId or pageId
  trigger,            // InteractionTriggers
  action,             // InteractionActions
  targetStateId = null,
  targetComponentId = null,
}) {
  return {
    id,
    scope,
    sourceId,
    trigger,
    action,
    targetStateId,
    targetComponentId,
  };
}
