export function renderResizeHandles(canvas, selection, state, onResizeStart) {
  canvas.querySelectorAll('.resize-handle').forEach((h) => h.remove());

  if (selection.selectedIds.size !== 1) return;

  const nodeId = [...selection.selectedIds][0];
  const node = state.nodes[nodeId];
  if (!node) return;
  if (node.parentId) {
    const parent = state.nodes[node.parentId];
    if (
      parent?.layout?.display === 'flex' ||
      parent?.layout?.display === 'grid'
    ) {
      return;
    }
  }
  const el = canvas.querySelector(`[data-node-id="${nodeId}"]`);
  if (!el) return;

  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  handle.dataset.nodeId = nodeId;

  Object.assign(handle.style, {
    position: 'absolute',
    width: '10px',
    height: '10px',
    background: '#3b82f6',
    boxSizing: 'border-box',
    borderRadius: '2px',
    right: '-5px',
    bottom: '-5px',
    cursor: 'nwse-resize',
    zIndex: 10,
  });

  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    onResizeStart(e);
  });

  if (window.getComputedStyle(el).position === 'static') {
    el.style.position = 'relative';
  }
  el.appendChild(handle);
}
