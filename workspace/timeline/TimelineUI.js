export class TimelineUI {
  constructor({
    container,
    shell,
  }) {
    this.container = container;
    this.shell = shell;

    this.isPlaying = false;
    this.playInterval = null;
  }

  mount() {
    this.container.innerHTML = `
      <button data-action="undo"><<</button>
      <button data-action="play">Play</button>
      <button data-action="redo">>></button>
      <input
        type="range"
        data-action="scrubber"
        min="0"
        max="0"
        value="0"
        step="1"
        style="width: 300px"
      />
    `;

    this.bindEvents();
    this.sync();
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      if (action === 'undo') this.undo();
      if (action === 'redo') this.redo();
      if (action === 'play') this.togglePlay();
    });

    this.container
      .querySelector('[data-action="scrubber"]')
      .addEventListener('input', (e) => {
        const index = Number(e.target.value);
        this.seek(index);
      });
  }

  sync() {
    const scrubber = this.container.querySelector('[data-action="scrubber"]');
    const total = this.shell.events.length;

    scrubber.max = Math.max(0, total - 1);

    const currentIndex = this.shell.events.findIndex(
      (e) => e.id === this.shell.cursor.eventId
    );

    scrubber.value = currentIndex === -1 ? scrubber.max : currentIndex;
  }

  currentIndex() {
    return this.shell.events.findIndex(
      (e) => e.id === this.shell.cursor.eventId
    );
  }

  undo() {
    const idx = this.currentIndex();
    if (idx <= 0) return;

    const prevEvent = this.shell.events[idx - 1];
    this.shell.setReplayMode(prevEvent.id);
    this.sync();
  }

  redo() {
    const idx = this.currentIndex();
    const next = this.shell.events[idx + 1];
    if (!next) return;

    this.shell.setReplayMode(next.id);
    this.sync();
  }

  seek(index) {
    const event = this.shell.events[index];
    if (!event) return;

    this.shell.setReplayMode(event.id);
    this.sync();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;

    this.playInterval = setInterval(() => {
      const idx = this.currentIndex();
      const next = this.shell.events[idx + 1];

      if (!next) {
        this.stop();
        return;
      }

      this.shell.setReplayMode(next.id);
      this.sync();
    }, 500);
  }

  stop() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
    this.playInterval = null;
  }
}
