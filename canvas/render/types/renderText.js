export function renderText(node) {
  const el = document.createElement('div');
  el.textContent = node.content || '';

  el.style.whiteSpace = 'pre-wrap';

  return el;
}
