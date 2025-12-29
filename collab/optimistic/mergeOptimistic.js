export function mergeOptimistic(base, pending) {
  let next = { ...base };

  Object.values(pending).forEach((patch) => {
    if (patch.type === 'node/move') {
      const { id, x, y } = patch.payload;
      next[id] = { ...next[id], x, y };
    }
  });

  return next;
}
