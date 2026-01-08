export function hitTestNode(event) {
  let el = event.target;

  while (el && el !== document.body) {
    if (el.dataset?.nodeId) return el.dataset.nodeId;
    el = el.parentElement;
  }

  return null;
}
