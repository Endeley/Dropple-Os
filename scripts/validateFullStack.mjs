#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

const commandGroups = [
  {
    name: 'Hygiene',
    commands: [
      'npm run check:generated-drift',
      'npm run release:trust:clean-generated',
    ],
  },
  {
    name: 'Constitutional',
    commands: [
      'npm run arch',
      'npm run enforce:laws',
      'npm run lint:export',
      'npm run lint:export:json',
    ],
  },
  {
    name: 'Architecture / Migration / Implementation',
    commands: [
      'npm run architecture:monitor',
      'npm run architecture:score',
      'npm run architecture:radar',
      'npm run architecture:phase',
      'npm run architecture:transition:audit',
      'npm run architecture:guard',
      'npm run architecture:ci',
      'npm run architecture:drift',
      'npm run implementation:navigator',
      'npm run migration:legacy-scan',
      'npm run template:registry:migrate',
    ],
  },
  {
    name: 'Engine Tests',
    commands: [
      'npm run engine:test',
      'npm run engine:shot:test',
      'npm run engine:track:test',
      'npm run engine:timeline:test',
      'npm run engine:dispatcher:test',
      'npm run engine:projection:test',
      'npm run engine:timeline:evaluate:test',
      'npm run engine:timeline:history:test',
      'npm run engine:timeline:controller:test',
      'npm run engine:timeline:controller:diff:test',
      'npm run engine:timeline:diff:test',
      'npm run engine:export:stability:test',
      'npm run engine:track:lock:test',
      'npm run engine:track:blend:test',
      'npm run engine:track:group:test',
      'npm run engine:timeline:dag:test',
      'npm run engine:timeline:label:test',
    ],
  },
  {
    name: 'Runtime / UI',
    commands: [
      'npm run runtime:map:test',
      'npm run runtime:replay:test',
      'npm run runtime:statehash:test',
      'npm run runtime:resize:session:test',
      'npm run ui:interactions:test',
    ],
  },
  {
    name: 'Node Test Runner Suites',
    commands: [
      'npm run test:engine:all',
      'npm run test:runtime:all',
      'npm run test:kernel',
      'npm run test:architecture',
      'npm run test:core:all',
      'npm run test:all',
    ],
  },
  {
    name: 'System / App Validation',
    commands: [
      'npm run test:system:runtime',
      'npm run test:system:app',
      'npm run test:system:all',
      'npm run validate:app',
      'npm run test:routes:smoke',
    ],
  },
  {
    name: 'Determinism / Template / Release',
    commands: [
      'npm run determinism',
      'npm run ci:determinism',
      'npm run template:verify-all',
      'npm run validate:all',
      'npm run validate:release',
      'npm run test:release:attestation',
      'npm run release:trust:report',
      'npm run release:trust:summary',
      'npm run release:trust:baseline:ensure',
      'node --import ./bench/register-alias-loader.mjs --test tests/release/releaseTrustDiff.test.mjs tests/release/releaseTrustReportSchema.test.mjs tests/release/releaseTrustSummary.test.mjs',
      'npm run test:release:operator-surfaces',
    ],
  },
];

const allCommands = commandGroups.flatMap((group) => group.commands);
const total = allCommands.length;

let index = 0;
for (const group of commandGroups) {
  console.log(`\n== ${group.name} ==`);
  for (const command of group.commands) {
    index += 1;
    console.log(`[${index}/${total}] ${command}`);
    if (dryRun) continue;
    const result = spawnSync(command, {
      cwd: process.cwd(),
      env: process.env,
      shell: true,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

if (dryRun) {
  console.log(`\nDry run complete: ${total} commands listed.`);
} else {
  console.log(`\nvalidate:fullstack complete: ${total} commands passed.`);
}
