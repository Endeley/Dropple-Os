export function computeFlexLayout(container, children) {
  const { autoLayout } = container.layout;
  const { direction, gap, padding } = autoLayout;

  let cursorX = padding;
  let cursorY = padding;

  return children.map((child) => {
    const next = {
      nodeId: child.id,
      x: cursorX,
      y: cursorY,
    };

    if (direction === 'row') {
      cursorX += child.layout.width + gap;
    } else {
      cursorY += child.layout.height + gap;
    }

    return next;
  });
}
