export class AnnotationStore {
  constructor() {
    this.annotations = [];
    this.listeners = new Set();
  }

  add(annotation) {
    this.annotations.push(annotation);
    this.notify();
  }

  getForEvent(eventId) {
    return this.annotations.filter((a) => a.eventId === eventId);
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) fn(this.annotations);
  }
}
