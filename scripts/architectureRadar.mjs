import {
  loadArchitectureInputs,
  loadOrBuildStatusReport,
  compareSystems,
  isIntegratedOrBetter,
  writeReport
} from './architectureUtils.mjs';

const { systemMap, dependencyGraph } = loadArchitectureInputs();
const statusReport = loadOrBuildStatusReport();

const candidates = Object.entries(statusReport.systems)
  .filter(([, entry]) => !isIntegratedOrBetter(entry.status))
  .filter(([systemId]) => {
    const dependencies = dependencyGraph[systemId] ?? [];
    return dependencies.every((dependencyId) =>
      isIntegratedOrBetter(statusReport.systems[dependencyId]?.status)
    );
  })
  .sort(([leftId, leftEntry], [rightId, rightEntry]) => {
    if (leftEntry.critical !== rightEntry.critical) {
      return leftEntry.critical ? -1 : 1;
    }
    if (leftEntry.score !== rightEntry.score) {
      return leftEntry.score - rightEntry.score;
    }
    return compareSystems(systemMap, leftId, rightId);
  });

const nextTargets = candidates.map(([systemId, entry]) => ({
  system: systemId,
  description: entry.description,
  status: entry.status,
  critical: entry.critical,
  phase: entry.phase,
  stage: entry.stage
}));

const report = {
  generatedAt: new Date().toISOString(),
  nextTargets
};

writeReport('reports/architecture-radar.json', report);

console.log('Dropple Development Radar');
console.log('');

if (nextTargets.length === 0) {
  console.log('No next targets available. All tracked systems are integrated or verified.');
} else {
  console.log('Recommended Next Systems');
  console.log('');
  nextTargets.forEach((target, index) => {
    console.log(`${index + 1}. ${target.system} — ${target.status}${target.critical ? ' [critical]' : ''} [${target.phase}/${target.stage}]`);
  });
}

console.log('');
console.log('Saved report: reports/architecture-radar.json');
