import { enforceAuthority } from '../runtime/guards/authorityGuard.js';

export class KeyboardController {
  constructor({ shell, interactions, messageBus }) {
    this.shell = shell;
    this.interactions = interactions;
    this.bus = messageBus;
  }

  mount() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  unmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  isCmd(e) {
    return e.metaKey || e.ctrlKey;
  }

  onKeyDown = (e) => {
    try {
      enforceAuthority(this.shell, 'keyboard');
    } catch (err) {
      return;
    }
    if (this.isCmd(e)) {
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
        return;
      }

      if (e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault();
        this.redo();
        return;
      }

      if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.duplicate();
        return;
      }
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.deleteSelected();
    }
  };

  undo() {
    const events = this.shell.events;
    const idx = events.findIndex(
      (ev) => ev.id === this.shell.cursor.eventId
    );

    if (idx <= 0) return;

    this.shell.setReplayMode(events[idx - 1].id);
  }

  redo() {
    const events = this.shell.events;
    const idx = events.findIndex(
      (ev) => ev.id === this.shell.cursor.eventId
    );

    const next = events[idx + 1];
    if (!next) return;

    this.shell.setReplayMode(next.id);
  }

  deleteSelected() {
    const ids = [...this.interactions.selection.selectedIds];
    if (!ids.length) return;

    for (const nodeId of ids) {
      this.bus.emit({
        type: 'node.delete',
        payload: { nodeId },
      });
    }

    this.interactions.selection.clear();
  }

  duplicate() {
    const ids = [...this.interactions.selection.selectedIds];
    if (!ids.length) return;

    const state = this.shell.getCurrentState();

    for (const nodeId of ids) {
      const node = state.nodes[nodeId];
      if (!node) continue;

      const newId = crypto.randomUUID();

      this.bus.emit({
        type: 'node.create',
        payload: {
          nodeId: newId,
          nodeType: node.type,
          parentId: node.parentId,
          initialProps: structuredClone(node.props),
        },
      });

      this.bus.emit({
        type: 'node.layout.update',
        payload: {
          nodeId: newId,
          layout: {
            ...node.layout,
            x: (node.layout?.x ?? 0) + 20,
            y: (node.layout?.y ?? 0) + 20,
          },
        },
      });

      if (node.style) {
        this.bus.emit({
          type: 'node.style.update',
          payload: {
            nodeId: newId,
            style: structuredClone(node.style),
          },
        });
      }

      if (node.content != null) {
        this.bus.emit({
          type: 'text.content.update',
          payload: {
            nodeId: newId,
            content: structuredClone(node.content),
          },
        });
      }
    }
  }
}
