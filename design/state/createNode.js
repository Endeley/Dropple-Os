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
    layout: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      constraints: {},
      autoLayout: null, // flex | grid (explicit)
      ...layout,
    },
    content,
  };
}
