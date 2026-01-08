import { enforceAuthority } from '../runtime/guards/authorityGuard.js';

export class AnnotationPanel {
  constructor({ container, shell, store }) {
    this.container = container;
    this.shell = shell;
    this.store = store;
  }

  render() {
    if (this.shell.cursor.authority !== 'controller') {
      this.container.textContent = 'Annotations are read-only';
      return;
    }

    this.container.innerHTML = `
      <textarea placeholder="Explain this step..."></textarea>
      <button>Add Annotation</button>
    `;

    const btn = this.container.querySelector('button');
    const textarea = this.container.querySelector('textarea');

    btn.onclick = () => {
      try {
        enforceAuthority(this.shell, 'annotation');
      } catch (err) {
        return;
      }
      const eventId = this.shell.cursor.eventId;
      if (!eventId || !textarea.value) return;

      this.store.add({
        id: crypto.randomUUID(),
        eventId,
        text: textarea.value,
        createdAt: Date.now(),
      });

      textarea.value = '';
    };
  }
}
