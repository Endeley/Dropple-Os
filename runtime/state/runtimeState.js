const runtimeState = {
  current: undefined,
};

export function getRuntimeState() {
  return runtimeState.current;
}

export function setRuntimeState(nextState) {
  runtimeState.current = nextState;
  return runtimeState.current;
}

export function resetRuntimeState() {
  runtimeState.current = undefined;
}
