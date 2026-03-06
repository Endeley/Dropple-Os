import { useRef } from 'react';

export function GapOverlay({ node, childrenNodes, emit, viewport, readOnly = false }) {
  const { autoLayout } = node.layout;
  const gap = autoLayout.gap ?? 0;
  const dragRef = useRef(null);

  if (gap <= 0 || !childrenNodes?.length) return null;

  const isRow =
    autoLayout.type === 'flex' ? autoLayout.direction === 'row' : true;
  const zoom = viewport?.zoom ?? 1;

  function beginDrag(e) {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof emit === 'function') {
      emit({
        type: 'intent.edit.begin',
        payload: { source: 'canvas.gap' },
      });
    }

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startGap: gap,
      lastGap: gap,
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onMove(e) {
    if (!dragRef.current) return;
    const delta = isRow
      ? (e.clientX - dragRef.current.startX) / zoom
      : (e.clientY - dragRef.current.startY) / zoom;

    const nextGap = Math.max(0, Math.round(dragRef.current.startGap + delta));
    if (nextGap === dragRef.current.lastGap) return;
    dragRef.current.lastGap = nextGap;

    if (typeof emit === 'function') {
      emit({
        type: 'node.layout.setAutoLayout',
        payload: {
          nodeId: node.id,
          config: { gap: nextGap },
        },
      });
    }
  }

  function onUp() {
    if (typeof emit === 'function') {
      emit({
        type: 'intent.edit.commit',
        payload: { source: 'canvas.gap' },
      });
    }
    dragRef.current = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }

  return (
    <>
      {childrenNodes.slice(0, -1).map((child, i) => {
        const left = isRow
          ? child.layout.x + child.layout.width
          : child.layout.x;
        const top = isRow
          ? child.layout.y
          : child.layout.y + child.layout.height;

        const w = isRow ? gap : child.layout.width;
        const h = isRow ? child.layout.height : gap;
        const handleSize = 10;
        const handleLeft = isRow ? left + w / 2 - handleSize / 2 : left + w / 2 - handleSize / 2;
        const handleTop = isRow ? top + h / 2 - handleSize / 2 : top + h / 2 - handleSize / 2;

        return (
          <div key={`${child.id}-gap`}>
            <div
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: h,
                background: 'rgba(59,130,246,0.12)',
                pointerEvents: 'none',
              }}
            />
            <div
              onPointerDown={beginDrag}
              style={{
                position: 'absolute',
                left: handleLeft,
                top: handleTop,
                width: handleSize,
                height: handleSize,
                borderRadius: 999,
                background: readOnly ? 'rgba(148,163,184,0.8)' : 'rgba(59,130,246,0.9)',
                cursor: readOnly ? 'not-allowed' : isRow ? 'ew-resize' : 'ns-resize',
                boxShadow: '0 0 0 2px rgba(15,23,42,0.2)',
                pointerEvents: 'auto',
              }}
              title="Drag to adjust gap"
            />
          </div>
        );
      })}
    </>
  );
}
