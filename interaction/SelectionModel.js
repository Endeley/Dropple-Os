export class SelectionModel {
  constructor() {
    this.selectedIds = new Set();
    this.listeners = new Set();
  }

  select(nodeId, additive = false) {
    if (!additive) this.clear();
    if (nodeId) this.selectedIds.add(nodeId);
    this.notify();
  }

  toggle(nodeId) {
    if (this.selectedIds.has(nodeId)) {
      this.selectedIds.delete(nodeId);
    } else {
      this.selectedIds.add(nodeId);
    }
    this.notify();
  }

  clear() {
    if (this.selectedIds.size === 0) return;
    this.selectedIds.clear();
    this.notify();
  }

  isSelected(nodeId) {
    return this.selectedIds.has(nodeId);
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) fn(this.selectedIds);
  }
}
