export class AnnotationOverlay {
  constructor({ container, store, shell }) {
    this.container = container;
    this.store = store;
    this.shell = shell;

    store.subscribe(() => this.render());
  }

  render() {
    const eventId = this.shell.cursor.eventId;
    const notes = this.store.getForEvent(eventId);

    this.container.innerHTML = '';
    for (const n of notes) {
      const el = document.createElement('div');
      el.textContent = n.text;
      el.className = 'annotation-bubble';
      this.container.appendChild(el);
    }
  }
}
