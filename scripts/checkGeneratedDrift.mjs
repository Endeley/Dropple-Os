#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const GENERATED_PATH_PATTERNS = [
  /^\.registry\/certifiedTemplates\.json$/,
  /^reports\/architecture-phase-progress\.json$/,
  /^reports\/architecture-radar\.json$/,
  /^reports\/architecture-score\.json$/,
  /^reports\/architecture-status\.json$/,
];

function runGitStatus() {
  const result = spawnSync('git', ['status', '--porcelain'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || '[GeneratedDriftCheck] unable to read git status\n');
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

function parseChangedPaths(statusOutput) {
  return statusOutput
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function isGeneratedPath(path) {
  return GENERATED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

const statusOutput = runGitStatus();
const changedPaths = parseChangedPaths(statusOutput);
const generatedChanges = changedPaths.filter(isGeneratedPath);
const nonGeneratedChanges = changedPaths.filter((path) => !isGeneratedPath(path));

if (generatedChanges.length === 0) {
  console.log('[GeneratedDriftCheck] OK: no generated registry/report drift detected.');
  process.exit(0);
}

console.log('[GeneratedDriftCheck] Detected generated drift:');
for (const path of generatedChanges) {
  console.log(`- ${path}`);
}

if (nonGeneratedChanges.length === 0) {
  console.log('[GeneratedDriftCheck] Only generated files changed. Use a dedicated artifact commit.');
  process.exit(0);
}

console.error('[GeneratedDriftCheck] Mixed commit risk: feature files + generated drift are both changed.');
console.error('[GeneratedDriftCheck] Recommended cleanup:');
console.error(
  "git restore .registry/certifiedTemplates.json reports/architecture-phase-progress.json reports/architecture-radar.json reports/architecture-score.json reports/architecture-status.json",
);
process.exit(2);
