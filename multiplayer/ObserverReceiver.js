import { MSG } from './protocol.js';

export class ObserverReceiver {
  constructor({ bus, shell, socket }) {
    this.bus = bus;
    this.shell = shell;
    this.socket = socket;
  }

  mount() {
    this.socket.onmessage = (msg) => {
      const { type, payload } = JSON.parse(msg.data);

      if (type === MSG.EVENT) {
        this.bus.emit(payload);
      }

      if (type === MSG.CURSOR) {
        this.shell.education.lockedCursor = payload.eventId;
        this.shell.render();
      }
    };
  }
}
