export class MessageBus {
  constructor() {
    this.events = [];
  }

  emit(type, payload) {
    this.events.push({ type, payload });
  }

  drain() {
    const copy = [...this.events];
    this.events = [];
    return copy;
  }
}
