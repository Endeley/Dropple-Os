export function createNode({
  id,
  type,
  parentId = null,
  props = {},
  style = {},
  layout = {},
  content = null,
}) {
  return {
    id,
    type,
    parentId,
    children: [],
    props,
    style,
    layout,
    content,
  };
}
