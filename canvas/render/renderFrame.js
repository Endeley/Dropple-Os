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

export function renderSnapGuides(ctx, guides) {
  if (!guides || !guides.length || !ctx) return;

  ctx.strokeStyle = '#4da3ff';
  ctx.lineWidth = 1;

  guides.forEach((guide) => {
    const pos = guide.x ?? guide.y ?? guide.position;
    ctx.beginPath();
    if (guide.type === 'vertical') {
      ctx.moveTo(pos, -100000);
      ctx.lineTo(pos, 100000);
    } else {
      ctx.moveTo(-100000, pos);
      ctx.lineTo(100000, pos);
    }
    ctx.stroke();
  });
}
