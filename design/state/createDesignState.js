export function createDesignState() {
  return {
    nodes: {},
    rootIds: [],
    version: 1,
    /**
     * Declarative transitions between named states.
     * Phase 2: storage only — no behavior.
     */
    transitions: {
      /**
       * Component-scoped transitions
       * {
       *   [componentId]: {
       *     [transitionId]: TransitionDefinition
       *   }
       * }
       */
      component: {},

      /**
       * Page-level transitions
       * {
       *   [transitionId]: TransitionDefinition
       * }
       */
      page: {},
    },
    interactions: {
      component: {},
      page: [],
    },
  };
}
