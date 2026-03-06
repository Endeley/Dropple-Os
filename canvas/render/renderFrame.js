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

export function renderGuides(ctx, guides) {
  if (!guides || !guides.length || !ctx) return;

  guides.forEach((guide) => {
    if (guide.type !== 'distance') return;
    if (
      !Number.isFinite(guide.x1) ||
      !Number.isFinite(guide.y1) ||
      !Number.isFinite(guide.x2) ||
      !Number.isFinite(guide.y2)
    ) {
      return;
    }

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(guide.x1, guide.y1);
    ctx.lineTo(guide.x2, guide.y2);
    ctx.stroke();
  });

  guides.forEach((guide) => {
    if (guide.type !== 'alignmentCluster') return;

    const x = guide.x ?? (guide.axis === 'x' ? guide.coordinate : null);
    const y = guide.y ?? (guide.axis === 'y' ? guide.coordinate : null);

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (guide.axis === 'x' && Number.isFinite(x)) {
      ctx.moveTo(x, -100000);
      ctx.lineTo(x, 100000);
    } else if (guide.axis === 'y' && Number.isFinite(y)) {
      ctx.moveTo(-100000, y);
      ctx.lineTo(100000, y);
    } else {
      return;
    }
    ctx.stroke();
  });

  guides.forEach((guide) => {
    if (guide.type !== 'gridPattern') return;
    const rows = Array.isArray(guide.rowCenters) ? guide.rowCenters : [];
    const cols = Array.isArray(guide.columnCenters) ? guide.columnCenters : [];
    if (!rows.length || !cols.length) return;

    ctx.strokeStyle = 'rgba(14,165,233,0.35)';
    ctx.lineWidth = 1;

    cols.forEach((x) => {
      if (!Number.isFinite(x)) return;
      ctx.beginPath();
      ctx.moveTo(x, -100000);
      ctx.lineTo(x, 100000);
      ctx.stroke();
    });

    rows.forEach((y) => {
      if (!Number.isFinite(y)) return;
      ctx.beginPath();
      ctx.moveTo(-100000, y);
      ctx.lineTo(100000, y);
      ctx.stroke();
    });
  });

  guides.forEach((guide) => {
    if (guide.type !== 'symmetryAxis') return;
    const x = guide.x ?? (guide.axis === 'vertical' ? guide.coordinate : null);
    const y = guide.y ?? (guide.axis === 'horizontal' ? guide.coordinate : null);

    ctx.save();
    ctx.strokeStyle = 'rgba(56,189,248,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    if (guide.axis === 'vertical' && Number.isFinite(x)) {
      ctx.moveTo(x, -100000);
      ctx.lineTo(x, 100000);
    } else if (guide.axis === 'horizontal' && Number.isFinite(y)) {
      ctx.moveTo(-100000, y);
      ctx.lineTo(100000, y);
    } else {
      ctx.restore();
      return;
    }
    ctx.stroke();
    ctx.restore();
  });
}

export function renderLayoutSuggestions(ctx, layouts) {
  if (!layouts || !layouts.length || !ctx) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(148,163,184,0.5)';
  ctx.fillStyle = 'rgba(148,163,184,0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);

  layouts.forEach((layout) => {
    if (!layout?.layout || !Array.isArray(layout.nodes) || !layout.bounds) return;
    const b = layout.bounds;
    if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) return;

    if (layout.layout === 'row' || layout.layout === 'column' || layout.layout === 'grid') {
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }
  });

  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(15,23,42,0.8)';
  ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  layouts.forEach((layout) => {
    if (!layout?.layout || !layout.bounds) return;
    const b = layout.bounds;
    if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) return;

    let label = layout.layout;
    if (layout.layout === 'grid' && Number.isFinite(layout.rows) && Number.isFinite(layout.columns)) {
      label = `Grid ${layout.columns}×${layout.rows}`;
    } else if (layout.layout === 'row') {
      label = 'Row';
    } else if (layout.layout === 'column') {
      label = 'Column';
    }

    const pad = 6;
    ctx.fillText(label, b.x + pad, b.y + pad + 10);
  });

  ctx.restore();
}
