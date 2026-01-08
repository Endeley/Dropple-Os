export class GuideOverlay {
  constructor(container) {
    this.container = container;

    this.vGuide = document.createElement('div');
    this.hGuide = document.createElement('div');

    Object.assign(this.vGuide.style, {
      position: 'absolute',
      top: '0',
      bottom: '0',
      width: '1px',
      background: '#3b82f6',
      pointerEvents: 'none',
      display: 'none',
      zIndex: 999,
    });

    Object.assign(this.hGuide.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      height: '1px',
      background: '#3b82f6',
      pointerEvents: 'none',
      display: 'none',
      zIndex: 999,
    });

    container.appendChild(this.vGuide);
    container.appendChild(this.hGuide);
  }

  showVertical(x) {
    this.vGuide.style.left = `${x}px`;
    this.vGuide.style.display = 'block';
  }

  showHorizontal(y) {
    this.hGuide.style.top = `${y}px`;
    this.hGuide.style.display = 'block';
  }

  clear() {
    this.vGuide.style.display = 'none';
    this.hGuide.style.display = 'none';
  }
}
