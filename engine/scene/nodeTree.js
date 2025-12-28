export function createNode({ id, type }) {
  return {
    id,
    type,
    children: [],
  };
}
