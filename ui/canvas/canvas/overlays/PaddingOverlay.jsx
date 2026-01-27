export function PaddingOverlay({ node }) {
  const { x, y, width, height, autoLayout } = node.layout;
  const p = autoLayout.padding ?? 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x + p,
        top: y + p,
        width: width - p * 2,
        height: height - p * 2,
        border: '1px dashed rgba(59,130,246,0.5)',
        boxSizing: 'border-box',
      }}
    />
  );
}
