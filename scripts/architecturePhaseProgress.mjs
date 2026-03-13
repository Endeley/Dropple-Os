import {
  buildPhaseProgressReport,
  buildStatusReport,
  loadArchitectureInputs,
  writeReport
} from './architectureUtils.mjs';

const { systemMap, dependencyGraph, phaseMap } = loadArchitectureInputs();
const statusReport = buildStatusReport(systemMap, dependencyGraph, phaseMap);
const report = buildPhaseProgressReport(statusReport);

writeReport('reports/architecture-phase-progress.json', report);

console.log('Dropple Phase Progress');
console.log('');

for (const [phaseId, phase] of Object.entries(report.phases)) {
  console.log(`${phaseId} ${String(phase.score).padStart(3)}% ${phase.status}`);

  for (const [stageId, stage] of Object.entries(phase.stages)) {
    console.log(`  - ${stageId}: ${String(stage.score).padStart(3)}% ${stage.status} (${stage.systemCount} systems)`);
  }

  console.log('');
}

console.log('Saved report: reports/architecture-phase-progress.json');
