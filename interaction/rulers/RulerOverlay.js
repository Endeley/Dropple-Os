export class RulerOverlay {
  constructor(container) {
    this.container = container;

    this.hRuler = document.createElement('div');
    this.vRuler = document.createElement('div');

    Object.assign(this.hRuler.style, {
      position: 'absolute',
      top: '0',
      left: '20px',
      right: '0',
      height: '20px',
      background: '#0f172a',
      color: '#94a3b8',
      fontSize: '10px',
      pointerEvents: 'none',
      zIndex: 1000,
    });

    Object.assign(this.vRuler.style, {
      position: 'absolute',
      top: '20px',
      left: '0',
      bottom: '0',
      width: '20px',
      background: '#0f172a',
      color: '#94a3b8',
      fontSize: '10px',
      pointerEvents: 'none',
      zIndex: 1000,
    });

    container.appendChild(this.hRuler);
    container.appendChild(this.vRuler);
  }
}
