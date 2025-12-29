import { InputSessionManager } from "../input/InputSessionManager.js";
import { MessageBus } from "@/core/messageBus";

function expect(condition, label) {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
}

function createMockSession(id = "session-1") {
  const calls = { start: [], update: [], commit: [], cancel: [] };

  return {
    id,
    type: "mock",
    calls,
    start(event) {
      calls.start.push(event);
    },
    update(event) {
      calls.update.push(event);
    },
    commit() {
      calls.commit.push("ok");
      return { committed: true };
    },
    cancel() {
      calls.cancel.push("ok");
    },
    getPreview() {
      return { preview: true };
    },
  };
}

function testHappyPath() {
  const bus = new MessageBus();
  const manager = new InputSessionManager(bus);
  const session = createMockSession();
  const startEvent = { pointerId: 1 };
  const updateEvent = { pointerId: 1, dx: 10 };

  manager.startSession(session, startEvent);
  manager.updateSession(updateEvent);
  const result = manager.commitSession();

  expect(result && result.committed === true, "commit returns payload");
  expect(session.calls.start.length === 1, "start called once");
  expect(session.calls.update.length === 1, "update called once");
  expect(session.calls.cancel.length === 0, "cancel not called");

  const events = bus.drain();
  expect(events.length === 3, "three bus events");
  expect(events[0].type === "session.start", "start event emitted");
  expect(events[1].type === "session.update", "update event emitted");
  expect(events[2].type === "session.commit", "commit event emitted");
}

function testGuards() {
  const bus = new MessageBus();
  const manager = new InputSessionManager(bus);
  const session = createMockSession("guard");
  const event = { pointerId: 2 };

  let threw = false;
  try {
    manager.updateSession(event);
  } catch (err) {
    threw = true;
  }
  expect(threw, "update throws when idle");

  manager.startSession(session, event);

  threw = false;
  try {
    manager.startSession(session, event);
  } catch (err) {
    threw = true;
  }
  expect(threw, "start throws when active");

  manager.cancelSession();
  expect(manager.state.state === "idle", "state reset after cancel");
}

function run() {
  testHappyPath();
  testGuards();
  console.log("✅ InputSessionManager smoke tests passed");
}

run();
