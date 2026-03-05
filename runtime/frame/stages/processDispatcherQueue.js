export function processDispatcherQueue(context) {
  // runtime state should already reflect dispatched events
  // frame pipeline must never mutate runtime state
  return context;
}
