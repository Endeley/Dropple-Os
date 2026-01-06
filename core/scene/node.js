export function createNode({ id, type = "frame", children = [], ...rest }) {
  if (!id) {
    throw new Error("createNode: id (nodeId) is required");
  }

  return {
    id,
    type,
    children,
    ...rest,
  };
}
