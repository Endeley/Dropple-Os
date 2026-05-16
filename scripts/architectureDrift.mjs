import fs from 'fs';
import path from 'path';
import { getArchitectureIgnoreDirs } from './architectureIgnorePolicy.mjs';

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const IGNORE_DIRS = getArchitectureIgnoreDirs(['reports']);

const RULES = [
  {
    id: 'core-imports-higher-layers',
    description: 'Core layer must not import runtime, ui, workspace, or product roots',
    roots: ['core'],
    patterns: [
      /from\s+['"]@\/runtime\//,
      /from\s+['"]@\/ui\//,
      /from\s+['"]@\/workspace\//,
      /from\s+['"]@\/workspaces\//,
      /from\s+['"]@\/product\//,
      /from\s+['"](?:\.\.\/)+(runtime|ui|workspace|workspaces|product)\//
    ]
  },
  {
    id: 'infrastructure-imports-higher-layers',
    description: 'Infrastructure layer must not import runtime, ui, workspace, or product roots',
    roots: ['infrastructure'],
    patterns: [
      /from\s+['"]@\/runtime\//,
      /from\s+['"]@\/ui\//,
      /from\s+['"]@\/workspace\//,
      /from\s+['"]@\/workspaces\//,
      /from\s+['"]@\/product\//,
      /from\s+['"](?:\.\.\/)+(runtime|ui|workspace|workspaces|product)\//
    ]
  },
  {
    id: 'runtime-imports-ui',
    description: 'Runtime layer must not import UI roots',
    roots: ['runtime'],
    patterns: [
      /from\s+['"]@\/ui\//,
      /from\s+['"](?:\.\.\/)+ui\//
    ]
  }
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(fullPath);
    }
  }

  return out;
}

function relative(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/');
}

function findViolations() {
  const violations = [];

  for (const rule of RULES) {
    for (const root of rule.roots) {
      const rootPath = path.join(ROOT, root);
      if (!fs.existsSync(rootPath)) continue;
      const files = walk(rootPath);

      for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');
        for (const pattern of rule.patterns) {
          if (pattern.test(source)) {
            violations.push({
              rule: rule.id,
              description: rule.description,
              file: relative(file)
            });
            break;
          }
        }
      }
    }
  }

  return violations;
}

const violations = findViolations();

console.log('Dropple Architecture Drift Check');
console.log('');

if (violations.length === 0) {
  console.log('No drift detected for the current high-confidence layer rules.');
  process.exit(0);
}

console.log('Architecture drift detected:');
for (const violation of violations) {
  console.log(`- ${violation.rule}: ${violation.file}`);
}

process.exit(1);
