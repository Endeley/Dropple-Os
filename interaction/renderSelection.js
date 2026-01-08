export function renderSelection(canvas, selection) {
  canvas.querySelectorAll('[data-node-id]').forEach((el) => {
    const id = el.dataset.nodeId;

    if (selection.isSelected(id)) {
      el.style.outline = '2px solid #3b82f6';
      el.style.outlineOffset = '2px';
    } else {
      el.style.outline = '';
      el.style.outlineOffset = '';
    }
  });
}
