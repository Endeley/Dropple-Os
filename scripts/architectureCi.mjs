import { loadArchitectureInputs, loadOrBuildStatusReport } from './architectureUtils.mjs';

const { systemMap } = loadArchitectureInputs();
const statusReport = loadOrBuildStatusReport();

const criticalMissing = [];
const criticalAttention = [];

for (const [systemId, entry] of Object.entries(statusReport.systems)) {
  if (!systemMap[systemId]?.critical) continue;

  if (entry.status === 'MISSING') {
    criticalMissing.push(systemId);
  } else if (entry.status === 'PARTIAL' || entry.status === 'SCAFFOLDED') {
    criticalAttention.push(`${systemId} (${entry.status})`);
  }
}

console.log('Dropple Architecture CI Gate');
console.log('');

if (criticalMissing.length > 0) {
  console.log('Critical missing systems:');
  for (const systemId of criticalMissing) {
    console.log(`- ${systemId}`);
  }
  console.log('');
  console.log('Build failed.');
  process.exit(1);
}

if (criticalAttention.length > 0) {
  console.log('Critical partial systems:');
  for (const systemId of criticalAttention) {
    console.log(`- ${systemId}`);
  }
  console.log('');
  console.log('Build warning only. Gate remains green.');
} else {
  console.log('All critical systems are integrated or verified.');
}
