const registry = new Map();

export const ModeRegistry = {
  register(mode) {
    if (!mode?.id) {
      throw new Error('Mode must have an id');
    }
    registry.set(mode.id, mode);
  },

  get(id) {
    if (!registry.has(id)) {
      throw new Error(`Mode "${id}" is not registered`);
    }
    return registry.get(id);
  },

  list() {
    return Array.from(registry.values());
  },
};
