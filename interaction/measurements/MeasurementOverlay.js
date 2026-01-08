export class MeasurementOverlay {
  constructor(container) {
    this.container = container;
    this.lines = [];
  }

  clear() {
    this.lines.forEach((l) => l.remove());
    this.lines = [];
  }

  drawLine({ x1, y1, x2, y2, label }) {
    const line = document.createElement('div');

    Object.assign(line.style, {
      position: 'absolute',
      left: `${Math.min(x1, x2)}px`,
      top: `${Math.min(y1, y2)}px`,
      width: `${Math.abs(x2 - x1) || 1}px`,
      height: `${Math.abs(y2 - y1) || 1}px`,
      borderTop: '1px dashed #38bdf8',
      pointerEvents: 'none',
      zIndex: 1001,
    });

    if (label) {
      const tag = document.createElement('div');
      tag.textContent = label;
      Object.assign(tag.style, {
        position: 'absolute',
        top: '-12px',
        left: '0',
        fontSize: '10px',
        color: '#38bdf8',
      });
      line.appendChild(tag);
    }

    this.container.appendChild(line);
    this.lines.push(line);
  }
}
