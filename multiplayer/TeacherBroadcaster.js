import { MSG } from './protocol.js';

export class TeacherBroadcaster {
  constructor({ bus, cursor, socket }) {
    this.bus = bus;
    this.cursor = cursor;
    this.socket = socket;
    this.unsubscribe = null;
  }

  mount() {
    this.unsubscribe = this.bus.subscribe((event) => {
      this.socket.send(
        JSON.stringify({
          type: MSG.EVENT,
          payload: event,
        })
      );
    });
  }

  unmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  broadcastCursor(eventId) {
    this.socket.send(
      JSON.stringify({
        type: MSG.CURSOR,
        payload: { eventId },
      })
    );
  }
}
