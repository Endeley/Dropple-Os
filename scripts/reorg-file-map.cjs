const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'docs', 'migrations');
const outFile = path.join(outDir, 'reorg-file-map.csv');
const exclude = new Set(['.git', 'node_modules', '.next']);

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isExcluded(rel) {
  const parts = rel.split(path.sep);
  return parts.some((p) => exclude.has(p));
}

function mapPath(rel) {
  // No legacy mappings remain; current structure is the source of truth.
  return rel.replace(/\\/g, '/');
}

function walk(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (isExcluded(rel)) continue;
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(rel);
    }
  }
}

const files = [];
walk(root, files);
files.sort();

ensureDir(outDir);
const lines = ['old_path,new_path,action'];
for (const rel of files) {
  const newRel = mapPath(rel);
  lines.push(`${rel.replace(/\"/g, '\"\"')},${newRel.replace(/\"/g, '\"\"')},keep`);
}

fs.writeFileSync(outFile, lines.join('\n'));
console.log(`Wrote ${lines.length - 1} rows to ${path.relative(root, outFile)}`);
