import { createCursor } from '../runtime/cursor/createCursor.js';
import { getDesignStateAtCursor } from '../runtime/replay/getDesignStateAtCursor.js';
import { renderDesignCanvas } from '../canvas/render/renderDesignCanvas.js';
import { renderSelection } from '../interaction/renderSelection.js';
import { renderResizeHandles } from '../interaction/renderResizeHandles.js';

export class WorkspaceShell {
  constructor({
    runId,
    messageBus,
    canvasContainer,
    mode = 'design',
  }) {
    this.runId = runId;
    this.messageBus = messageBus;
    this.canvasContainer = canvasContainer;
    this.mode = mode;

    this.cursor = createCursor({
      runId,
      mode: 'replay',
      authority: 'observer',
    });

    this.education = {
      enabled: false,
      lockedCursor: null,
    };

    this.events = [];
    this.unsubscribe = null;
  }

  mount() {
    this.unsubscribe = this.messageBus.subscribe((event) => {
      if (event.runId !== this.runId) return;

      this.events.push(event);
      this.render();
    });

    this.render();
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  setCursorEvent(eventId) {
    this.cursor = {
      ...this.cursor,
      eventId,
    };
    this.render();
  }

  setLiveMode() {
    this.cursor = {
      ...this.cursor,
      mode: 'live',
    };
    this.render();
  }

  setReplayMode(eventId = null) {
    this.cursor = {
      ...this.cursor,
      mode: 'replay',
      eventId,
    };
    this.render();
  }

  enableEducationMode() {
    this.education.enabled = true;
  }

  disableEducationMode() {
    this.education.enabled = false;
  }

  setTeacherCursor(eventId) {
    if (this.cursor.authority !== 'controller') return;

    this.education.lockedCursor = eventId;
    this.setReplayMode(eventId);
  }

  peekAt(eventId, duration = 3000) {
    if (!this.education.enabled) return;

    const original = this.education.lockedCursor;
    this.setReplayMode(eventId);

    setTimeout(() => {
      this.setReplayMode(original);
    }, duration);
  }

  playLesson(speed = 800) {
    if (this.cursor.authority !== 'controller') return;

    const events = this.events;
    let i = events.findIndex((e) => e.id === this.education.lockedCursor);

    const interval = setInterval(() => {
      const next = events[++i];
      if (!next) return clearInterval(interval);

      this.setTeacherCursor(next.id);
    }, speed);
  }

  getCurrentState() {
    return getDesignStateAtCursor({
      events: this.events,
      cursor: this.cursor,
    });
  }

  render() {
    if (this.mode !== 'design') return;

    const effectiveCursor =
      this.education.enabled && this.cursor.authority === 'observer'
        ? { ...this.cursor, eventId: this.education.lockedCursor }
        : this.cursor;

    const state = getDesignStateAtCursor({
      events: this.events,
      cursor: effectiveCursor,
    });

    renderDesignCanvas({
      state,
      container: this.canvasContainer,
    });

    if (this.interactions) {
      renderSelection(
        this.canvasContainer,
        this.interactions.selection
      );

      renderResizeHandles(
        this.canvasContainer,
        this.interactions.selection,
        state,
        this.interactions.onResizeStart
      );
    }

    if (this.timelineUI) {
      this.timelineUI.sync();
    }
  }
}
