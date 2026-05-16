import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getArchitectureIgnoreDirs,
  shouldIgnoreArchitecturePath,
} from "../../scripts/architectureIgnorePolicy.mjs";

const ROOT = process.cwd();
const ALLOWED_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const IGNORE_DIRS = getArchitectureIgnoreDirs(["convex/_generated"]);
const IGNORE_FILES = new Set(["tests/architecture/dispatcherOwnership.test.ts"]);

function shouldIgnore(relPath) {
  const normalized = relPath.replaceAll("\\", "/");
  if (IGNORE_FILES.has(normalized)) return true;
  return shouldIgnoreArchitecturePath(normalized, IGNORE_DIRS);
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
    matches[0]?.startsWith("ui/workspace/root/WorkspaceRoot.jsx:"),
    true,
    `Expected owner to be ui/workspace/root/WorkspaceRoot.jsx, got ${matches[0]}`
  );
});
