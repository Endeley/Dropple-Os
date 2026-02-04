import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ALLOWED_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const IGNORE_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "out",
  "build",
  "convex/_generated",
]);
const IGNORE_FILES = new Set(["tests/architecture/dispatcherOwnership.test.ts"]);

function shouldIgnore(relPath) {
  const normalized = relPath.replaceAll("\\", "/");
  if (IGNORE_FILES.has(normalized)) return true;
  for (const item of IGNORE_DIRS) {
    if (normalized === item || normalized.startsWith(`${item}/`)) return true;
  }
  return false;
}

function walk(dir, relBase = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (shouldIgnore(relPath)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, relPath));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!ALLOWED_EXT.has(path.extname(entry.name))) continue;
    files.push({ fullPath, relPath });
  }
  return files;
}

test("has exactly one DispatcherProvider instantiation", () => {
  const matches = [];
  const jsxProviderStart = /^\s*<DispatcherProvider\b/;
  for (const file of walk(ROOT)) {
    const content = fs.readFileSync(file.fullPath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (jsxProviderStart.test(line)) {
        matches.push(`${file.relPath}:${index + 1}`);
      }
    });
  }

  assert.equal(
    matches.length,
    1,
    `Expected exactly one <DispatcherProvider> instance, found ${matches.length}:\n${matches.join("\n")}`
  );
  assert.equal(
    matches[0]?.startsWith("workspace/WorkspaceRoot/WorkspaceRoot.jsx:"),
    true,
    `Expected owner to be workspace/WorkspaceRoot/WorkspaceRoot.jsx, got ${matches[0]}`
  );
});
