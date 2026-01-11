export function createDesignState() {
  return {
    nodes: {},
    rootIds: [],
    version: 1,
    transitions: {
      byId: {},
      byStatePair: {},
    },
  };
}
