import { loadArchitectureInputs, loadOrBuildStatusReport, compareSystems, writeReport } from './architectureUtils.mjs';

const { systemMap, dependencyGraph } = loadArchitectureInputs();
const statusReport = loadOrBuildStatusReport();

const candidates = Object.entries(statusReport.systems)
  .filter(([, entry]) => entry.status !== 'INTEGRATED')
  .filter(([systemId]) => {
    const dependencies = dependencyGraph[systemId] ?? [];
    return dependencies.every((dependencyId) => statusReport.systems[dependencyId]?.status === 'INTEGRATED');
  })
  .sort(([leftId, leftEntry], [rightId, rightEntry]) => {
    if (leftEntry.critical !== rightEntry.critical) {
      return leftEntry.critical ? -1 : 1;
    }
    return compareSystems(systemMap, leftId, rightId);
  });

const nextTargets = candidates.map(([systemId, entry]) => ({
  system: systemId,
  description: entry.description,
  status: entry.status,
  critical: entry.critical
}));

const report = {
  generatedAt: new Date().toISOString(),
  nextTargets
};

writeReport('reports/architecture-radar.json', report);

console.log('Dropple Development Radar');
console.log('');

if (nextTargets.length === 0) {
  console.log('No next targets available. All tracked systems are integrated.');
} else {
  console.log('Recommended Next Systems');
  console.log('');
  nextTargets.forEach((target, index) => {
    console.log(`${index + 1}. ${target.system} — ${target.status}${target.critical ? ' [critical]' : ''}`);
  });
}

console.log('');
console.log('Saved report: reports/architecture-radar.json');
