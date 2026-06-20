import fs from 'fs';
import path from 'path';
import { getArchitectureScannerPolicy } from './architectureIgnorePolicy.mjs';
import { ARCHITECTURE_DRIFT_RULES } from './architectureDriftRules.mjs';

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const SCANNER_POLICY = getArchitectureScannerPolicy({
  scannerId: 'architectureDrift',
});
const IGNORE_DIRS = SCANNER_POLICY.ignoreDirs;

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

function findMatchedLine(source, pattern) {
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    pattern.lastIndex = 0;
    if (pattern.test(line)) {
      return {
        lineNumber: index + 1,
        snippet: line.trim(),
      };
    }
  }

  pattern.lastIndex = 0;
  const match = pattern.exec(source);
  pattern.lastIndex = 0;
  if (!match || typeof match.index !== 'number') {
    return {
      lineNumber: null,
      snippet: null,
    };
  }

  const start = match.index;
  const prefix = source.slice(0, start);
  const lineNumber = prefix.split('\n').length;
  const line = source.split('\n')[lineNumber - 1] ?? '';
  return {
    lineNumber,
    snippet: line.trim() || String(match[0]).trim() || null,
  };
}

export function findViolations({ rules = ARCHITECTURE_DRIFT_RULES } = {}) {
  const violations = [];

  for (const rule of rules) {
    for (const root of rule.roots) {
      const rootPath = path.join(ROOT, root);
      if (!fs.existsSync(rootPath)) continue;
      const files = walk(rootPath);

      for (const file of files) {
        if (Array.isArray(rule.fileMatchers) && rule.fileMatchers.length > 0) {
          const rel = relative(file);
          const matched = rule.fileMatchers.some((suffix) => rel.endsWith(String(suffix)));
          if (!matched) continue;
        }
        const source = fs.readFileSync(file, 'utf8');
        for (const pattern of rule.patterns) {
          pattern.lastIndex = 0;
          if (pattern.test(source)) {
            const match = findMatchedLine(source, pattern);
            violations.push({
              ruleId: rule.id,
              legacyRuleId: rule.legacyId,
              ruleName: rule.name,
              description: rule.description,
              owner: rule.owner,
              law: rule.law,
              reason: rule.reason,
              suggestedFix: rule.suggestedFix,
              file: relative(file),
              lineNumber: match.lineNumber,
              matchedSnippet: match.snippet,
            });
            break;
          }
        }
      }
    }
  }

  return violations;
}

export function formatViolation(violation) {
  const lines = [
    '------------------------------------------------------------',
    violation.ruleId,
    '',
    'Rule',
    violation.ruleName,
    '',
    'File',
    violation.lineNumber ? `${violation.file}:${violation.lineNumber}` : violation.file,
    '',
    'Matched Snippet',
    violation.matchedSnippet ?? '(match unavailable)',
    '',
    'Constitution',
    violation.law,
    `Layer: ${violation.owner}`,
    '',
    'Reason',
    violation.reason,
    '',
    'Suggested Fix',
    violation.suggestedFix,
  ];

  if (violation.legacyRuleId) {
    lines.push('', 'Legacy Rule', violation.legacyRuleId);
  }

  return lines.join('\n');
}

export function formatDriftReport({ violations = [], rules = ARCHITECTURE_DRIFT_RULES } = {}) {
  const lines = [
    'Dropple Architecture Drift Check',
    '',
  ];

  if (violations.length === 0) {
    lines.push('No drift detected for the current high-confidence layer rules.');
    lines.push(`Rules Evaluated: ${rules.length}`);
    return `${lines.join('\n')}\n`;
  }

  lines.push('Architecture drift detected:');
  lines.push('');
  lines.push(...violations.map((violation) => formatViolation(violation)));
  lines.push('------------------------------------------------------------');
  lines.push(`Violations: ${violations.length}`);
  lines.push(`Rules Evaluated: ${rules.length}`);
  return `${lines.join('\n')}\n`;
}

export function runArchitectureDrift() {
  const violations = findViolations();
  const output = formatDriftReport({ violations });
  const ok = violations.length === 0;
  return Object.freeze({
    ok,
    violations,
    output,
    rulesEvaluated: ARCHITECTURE_DRIFT_RULES.length,
  });
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isDirectRun) {
  const result = runArchitectureDrift();
  process.stdout.write(result.output);
  process.exit(result.ok ? 0 : 1);
}
