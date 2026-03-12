import { loadArchitectureInputs, loadOrBuildStatusReport, STATUS_SCORES, scoreBar, writeReport } from './architectureUtils.mjs';

const { systemMap } = loadArchitectureInputs();
const statusReport = loadOrBuildStatusReport();
const groupStats = new Map();

for (const [systemId, entry] of Object.entries(statusReport.systems)) {
  const config = systemMap[systemId];
  const group = entry.group || 'ungrouped';
  const weight = config?.critical ? 2 : 1;
  const score = STATUS_SCORES[entry.status] ?? 0;

  if (!groupStats.has(group)) {
    groupStats.set(group, { weightedScore: 0, weight: 0 });
  }

  const bucket = groupStats.get(group);
  bucket.weightedScore += score * weight;
  bucket.weight += weight;
}

const groups = {};
let totalWeightedScore = 0;
let totalWeight = 0;

for (const [group, bucket] of groupStats) {
  const score = bucket.weight === 0 ? 0 : Math.round(bucket.weightedScore / bucket.weight);
  groups[group] = score;
  totalWeightedScore += bucket.weightedScore;
  totalWeight += bucket.weight;
}

const total = totalWeight === 0 ? 0 : Math.round(totalWeightedScore / totalWeight);
const report = {
  generatedAt: new Date().toISOString(),
  weights: STATUS_SCORES,
  groups,
  total
};

writeReport('reports/architecture-score.json', report);

console.log('Dropple Architecture Health');
console.log('');

for (const [group, score] of Object.entries(groups)) {
  console.log(`${group.padEnd(18)} ${scoreBar(score)} ${String(score).padStart(3)}%`);
}

console.log('');
console.log(`Total Architecture Health: ${total}%`);
console.log('Saved report: reports/architecture-score.json');
