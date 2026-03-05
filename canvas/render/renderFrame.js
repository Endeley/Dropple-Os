export function renderSelectionOverlay(ctx, overlay) {
  if (!overlay || !ctx || typeof ctx.strokeRect !== 'function') return;

  ctx.strokeStyle = '#4da3ff';
  ctx.lineWidth = 1;

  overlay.forEach((box) => {
    const b = box.bounds;
    if (!b) return;
    ctx.strokeRect(b.x, b.y, b.width, b.height);
  });
}
