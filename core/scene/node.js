export function createNode(partial) {
  return {
    id: crypto.randomUUID(),
    type: "frame",
    children: [],
    ...partial,
  };
}
