// runtime/hooks/runtimeInstrumentation.js

let hooks = {
  onInterpolate: null,
};

export function registerRuntimeInstrumentation(newHooks = {}) {
  hooks = { ...hooks, ...newHooks };
}

export function getRuntimeHooks() {
  return hooks;
}
