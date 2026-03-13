import { buildStatusReport, loadArchitectureInputs, writeReport } from './architectureUtils.mjs';

const { systemMap, dependencyGraph, phaseMap } = loadArchitectureInputs();
const report = buildStatusReport(systemMap, dependencyGraph, phaseMap);

writeReport('reports/architecture-status.json', report);

console.log('Dropple Architecture Monitor');
console.log('');

const groups = new Map();
for (const [systemId, entry] of Object.entries(report.systems)) {
  const key = entry.group || 'ungrouped';
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push([systemId, entry]);
}

for (const [group, entries] of groups) {
  console.log(group);
  for (const [systemId, entry] of entries) {
    const icon =
      entry.status === 'VERIFIED' ? '◆' :
      entry.status === 'INTEGRATED' ? '✔' :
      entry.status === 'PARTIAL' || entry.status === 'SCAFFOLDED' ? '⚠' :
      '✘';
    console.log(`  ${icon} ${systemId} — ${entry.status} [${entry.phase}/${entry.stage}]`);

    if (entry.missingRequiredFiles.length > 0) {
      console.log(`    missing required files: ${entry.missingRequiredFiles.join(', ')}`);
    }

    if (entry.missingRequiredTests.length > 0) {
      console.log(`    missing required tests: ${entry.missingRequiredTests.join(', ')}`);
    }

    if (entry.missingOptionalFiles.length > 0) {
      console.log(`    missing optional files: ${entry.missingOptionalFiles.join(', ')}`);
    }

    if (entry.blockedBy.length > 0) {
      console.log(`    blocked by: ${entry.blockedBy.join(', ')}`);
    }
  }
  console.log('');
}

console.log('Saved report: reports/architecture-status.json');
