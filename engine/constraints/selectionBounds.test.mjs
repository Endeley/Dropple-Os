import { computeSelectionBounds } from "./selectionBounds.js";

const nodes = [
  { x: 10, y: 20, width: 100, height: 50 },
  { x: 50, y: 60, width: 30, height: 20 },
];

const bounds = computeSelectionBounds(nodes);

if (bounds.minX !== 10) throw new Error("minX mismatch");
if (bounds.minY !== 20) throw new Error("minY mismatch");
if (bounds.maxX !== 110) throw new Error("maxX mismatch");
if (bounds.maxY !== 80) throw new Error("maxY mismatch");
if (bounds.width !== 100) throw new Error("width mismatch");
if (bounds.height !== 60) throw new Error("height mismatch");

console.log("✅ selectionBounds tests passed");
