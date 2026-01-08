const TICK = 50;

export function renderRulers(ruler, length, orientation = 'horizontal') {
  ruler.innerHTML = '';

  for (let i = 0; i < length; i += TICK) {
    const tick = document.createElement('div');
    tick.textContent = i;

    Object.assign(tick.style, {
      position: 'absolute',
      [orientation === 'horizontal' ? 'left' : 'top']: `${i}px`,
      padding: '2px',
      whiteSpace: 'nowrap',
    });

    ruler.appendChild(tick);
  }
}
