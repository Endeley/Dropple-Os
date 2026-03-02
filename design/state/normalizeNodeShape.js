/**
 * Normalizes design node fields without owning identity.
 *
 * Canonical node creation MUST use `@/core/nodes/createNode`.
 * This helper only prepares consistent defaults for design state.
 */
export function normalizeNodeShape({
  id,
  type = 'frame',
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
    // Required for canonical projection
    transform: {
      x: layout?.x ?? 0,
      y: layout?.y ?? 0,
    },
    meta: {},
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
