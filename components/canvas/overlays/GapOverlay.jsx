export function GapOverlay({ node, childrenNodes }) {
  const { autoLayout } = node.layout;
  const gap = autoLayout.gap ?? 0;

  if (gap <= 0) return null;

  return (
    <>
      {childrenNodes.slice(0, -1).map((child, i) => {
        const isRow =
          autoLayout.type === 'flex' ? autoLayout.direction === 'row' : true;

        const left = isRow
          ? child.layout.x + child.layout.width
          : child.layout.x;
        const top = isRow
          ? child.layout.y
          : child.layout.y + child.layout.height;

        const w = isRow ? gap : child.layout.width;
        const h = isRow ? child.layout.height : gap;

        return (
          <div
            key={`${child.id}-gap`}
            style={{
              position: 'absolute',
              left,
              top,
              width: w,
              height: h,
              background: 'rgba(59,130,246,0.12)',
            }}
          />
        );
      })}
    </>
  );
}
