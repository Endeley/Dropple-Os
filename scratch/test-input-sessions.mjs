import { PointerMap } from "../input/pointerMap.js";
import { MoveSession } from "../input/sessions/MoveSession.js";
import { ResizeSession } from "../input/sessions/ResizeSession.js";
import { DrawSession } from "../input/sessions/DrawSession.js";
import { TextSession } from "../input/sessions/TextSession.js";

function expect(condition, label) {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
}

function testPointerMap() {
  const map = new PointerMap();
  map.set(1, "a");
  expect(map.get(1) === "a", "get returns value");
  expect(map.has(1), "has detects pointer");

  let cleared = [];
  map.clear((value, id) => cleared.push({ value, id }));
  expect(cleared.length === 1 && cleared[0].value === "a", "clear callback runs");
  expect(!map.has(1), "map empty after clear");
}

function createMockEvent(x, y) {
  return { clientX: x, clientY: y };
}

function testMoveSessionFlow() {
  const session = new MoveSession({
    nodeIds: ["a", "b"],
    startPointer: { x: 0, y: 0 },
  });

  session.update(createMockEvent(5, 5));

  const preview = session.getPreview();
  expect(preview.delta.x === 5 && preview.delta.y === 5, "preview delta correct");

  const result = session.commit();
  expect(result.delta.x === 5 && result.delta.y === 5, "commit delta correct");
  expect(result.nodeIds.join(",") === "a,b", "nodeIds preserved");
}

function testResizeSession() {
  const session = new ResizeSession(1, { width: 10, height: 20 });
  session.start(createMockEvent(0, 0));
  session.update(createMockEvent(5, 15));
  const result = session.commit();
  expect(result.width === 15 && result.height === 35, "resize totals");
}

function testDrawSession() {
  const session = new DrawSession(1);
  session.start(createMockEvent(1, 1));
  session.update(createMockEvent(2, 2));
  const points = session.commit();
  expect(points.length === 2 && points[1].x === 2 && points[1].y === 2, "draw points captured");
}

function testTextSession() {
  const session = new TextSession(1, { initialText: "hi" });
  session.start(createMockEvent(3, 4));
  session.setText("hello");
  const result = session.commit();
  expect(result.text === "hello", "text commit contains value");
  expect(result.anchor && result.anchor.x === 3 && result.anchor.y === 4, "text anchor captured");
}

function run() {
  testPointerMap();
  testMoveSessionFlow();
  testResizeSession();
  testDrawSession();
  testTextSession();
  console.log("✅ Input session scratch tests passed");
}

run();
