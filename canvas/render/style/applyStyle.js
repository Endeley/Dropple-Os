export function applyStyle(el, style = {}) {
  for (const [key, value] of Object.entries(style)) {
    el.style[key] = value;
  }
}
