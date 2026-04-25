import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ARCH_DIR = path.join(ROOT, 'architecture');
const REPORTS_DIR = path.join(ROOT, 'reports');

export const STATUS = {
  MISSING: 'MISSING',
  SCAFFOLDED: 'SCAFFOLDED',
  PARTIAL: 'PARTIAL',
  INTEGRATED: 'INTEGRATED',
  VERIFIED: 'VERIFIED'
};

export const STATUS_ORDER = [
  STATUS.MISSING,
  STATUS.SCAFFOLDED,
  STATUS.PARTIAL,
  STATUS.INTEGRATED,
  STATUS.VERIFIED
];

export const STATUS_SCORES = {
  [STATUS.MISSING]: 0,
  [STATUS.SCAFFOLDED]: 30,
  [STATUS.PARTIAL]: 55,
  [STATUS.INTEGRATED]: 80,
  [STATUS.VERIFIED]: 100
};

export function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function loadArchitectureInputs() {
  const systemMap = readJson(path.join('architecture', 'systemMap.json'));
  const dependencyGraph = readJson(path.join('architecture', 'dependencyGraph.json'));
  const phaseMap = readJson(path.join('architecture', 'phaseMap.json'));
  return { systemMap, dependencyGraph, phaseMap };
}

export function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

export function writeReport(relativePath, data) {
  ensureReportsDir();
  const filePath = path.join(ROOT, relativePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function readStatusReport() {
  return readJson(path.join('reports', 'architecture-status.json'));
}

export function statusReportExists() {
  return fileExists(path.join('reports', 'architecture-status.json'));
}

export function loadOrBuildStatusReport() {
  const { systemMap, dependencyGraph, phaseMap } = loadArchitectureInputs();
  const report = buildStatusReport(systemMap, dependencyGraph, phaseMap);
  writeReport('reports/architecture-status.json', report);
  return report;
}

export function listMissing(paths = []) {
  return paths.filter((target) => !fileExists(target));
}

export function validateArchitectureInputs(systemMap, dependencyGraph, phaseMap) {
  const systemIds = new Set(Object.keys(systemMap));
  const phaseIds = new Set(Object.keys(phaseMap));

  for (const [systemId, deps] of Object.entries(dependencyGraph)) {
    if (!systemIds.has(systemId)) {
      throw new Error(`dependencyGraph references unknown system "${systemId}"`);
    }

    for (const dep of deps) {
      if (!systemIds.has(dep)) {
        throw new Error(`dependencyGraph for "${systemId}" references unknown dependency "${dep}"`);
      }
    }
  }

  for (const [systemId, config] of Object.entries(systemMap)) {
    if (!Array.isArray(config.requiredFiles)) {
      throw new Error(`system "${systemId}" is missing requiredFiles[]`);
    }

    if (!Array.isArray(config.requiredTests)) {
      throw new Error(`system "${systemId}" is missing requiredTests[]`);
    }

    if (!Array.isArray(config.optionalFiles)) {
      throw new Error(`system "${systemId}" is missing optionalFiles[]`);
    }

    if (config.verifyCommands && !Array.isArray(config.verifyCommands)) {
      throw new Error(`system "${systemId}" must define verifyCommands[] when present`);
    }

    if (!phaseIds.has(systemId)) {
      throw new Error(`phaseMap is missing system "${systemId}"`);
    }
  }

  for (const phaseId of phaseIds) {
    if (!systemIds.has(phaseId)) {
      throw new Error(`phaseMap references unknown system "${phaseId}"`);
    }
  }
}

export function topologicalOrder(systemMap, dependencyGraph) {
  const indegree = new Map();
  const children = new Map();
  const systems = Object.keys(systemMap);

  for (const id of systems) {
    indegree.set(id, 0);
    children.set(id, []);
  }

  for (const [id, deps] of Object.entries(dependencyGraph)) {
    indegree.set(id, deps.length);
    for (const dep of deps) {
      children.get(dep).push(id);
    }
  }

  const ready = systems
    .filter((id) => indegree.get(id) === 0)
    .sort((a, b) => compareSystems(systemMap, a, b));

  const order = [];

  while (ready.length > 0) {
    const current = ready.shift();
    order.push(current);

    for (const child of children.get(current)) {
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) {
        ready.push(child);
      }
    }

    ready.sort((a, b) => compareSystems(systemMap, a, b));
  }

  if (order.length !== systems.length) {
    throw new Error('dependencyGraph contains a cycle');
  }

  return order;
}

export function compareSystems(systemMap, left, right) {
  const leftOrder = systemMap[left]?.order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = systemMap[right]?.order ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.localeCompare(right);
}

export function statusToScore(status) {
  return STATUS_SCORES[status] ?? 0;
}

export function isIntegratedOrBetter(status) {
  return status === STATUS.INTEGRATED || status === STATUS.VERIFIED;
}

export function scoreToStatus(score) {
  if (score >= STATUS_SCORES[STATUS.VERIFIED]) return STATUS.VERIFIED;
  if (score >= STATUS_SCORES[STATUS.INTEGRATED]) return STATUS.INTEGRATED;
  if (score >= STATUS_SCORES[STATUS.PARTIAL]) return STATUS.PARTIAL;
  if (score >= STATUS_SCORES[STATUS.SCAFFOLDED]) return STATUS.SCAFFOLDED;
  return STATUS.MISSING;
}

function resolveStatus({
  missingRequiredFiles,
  missingRequiredTests,
  missingOptionalFiles,
  blockedBy,
  verifyCommands
}) {
  if (missingRequiredFiles.length > 0) {
    return STATUS.MISSING;
  }

  if (missingRequiredTests.length > 0) {
    return STATUS.SCAFFOLDED;
  }

  if (blockedBy.length > 0) {
    return STATUS.PARTIAL;
  }

  if (missingOptionalFiles.length === 0) {
    return STATUS.VERIFIED;
  }

  return STATUS.INTEGRATED;
}

export function buildStatusReport(systemMap, dependencyGraph, phaseMap) {
  validateArchitectureInputs(systemMap, dependencyGraph, phaseMap);
  const ordered = topologicalOrder(systemMap, dependencyGraph);
  const systems = {};

  for (const systemId of ordered) {
    const config = systemMap[systemId];
    const meta = phaseMap[systemId] || {};
    const missingRequiredFiles = listMissing(config.requiredFiles);
    const missingRequiredTests = listMissing(config.requiredTests);
    const missingOptionalFiles = listMissing(config.optionalFiles);
    const verifyCommands = config.verifyCommands || [];
    const dependencyStatuses = (dependencyGraph[systemId] ?? []).map((dependencyId) => ({
      system: dependencyId,
      status: systems[dependencyId].status
    }));
    const blockedBy = dependencyStatuses
      .filter(({ status }) => !isIntegratedOrBetter(status))
      .map(({ system }) => system);

    const status = resolveStatus({
      missingRequiredFiles,
      missingRequiredTests,
      missingOptionalFiles,
      blockedBy,
      verifyCommands
    });

    const evidence = {
      requiredFilesPresent: config.requiredFiles.length - missingRequiredFiles.length,
      requiredFilesTotal: config.requiredFiles.length,
      requiredTestsPresent: config.requiredTests.length - missingRequiredTests.length,
      requiredTestsTotal: config.requiredTests.length,
      optionalFilesPresent: config.optionalFiles.length - missingOptionalFiles.length,
      optionalFilesTotal: config.optionalFiles.length,
      optionalEvidenceComplete: missingOptionalFiles.length === 0,
      verifyCommandsConfigured: verifyCommands.length,
      verifyCommandsTotal: verifyCommands.length
    };

    systems[systemId] = {
      description: config.description,
      group: config.group,
      phase: meta.phase ?? null,
      stage: meta.stage ?? null,
      layer: meta.layer ?? config.group ?? null,
      critical: Boolean(config.critical),
      order: config.order ?? null,
      status,
      score: statusToScore(status),
      dependencies: dependencyGraph[systemId] ?? [],
      blockedBy,
      requiredFiles: config.requiredFiles,
      requiredTests: config.requiredTests,
      optionalFiles: config.optionalFiles,
      verifyCommands,
      missingRequiredFiles,
      missingRequiredTests,
      missingOptionalFiles,
      evidence
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    statusScale: STATUS_ORDER,
    statusScores: STATUS_SCORES,
    systems
  };
}

export function buildPhaseProgressReport(statusReport) {
  const phases = {};

  for (const [systemId, entry] of Object.entries(statusReport.systems)) {
    const phaseId = entry.phase || 'unassigned';
    const stageId = entry.stage || 'unassigned';

    if (!phases[phaseId]) {
      phases[phaseId] = {
        score: 0,
        status: STATUS.MISSING,
        systemCount: 0,
        statusCounts: createStatusCounter(),
        stages: {}
      };
    }

    if (!phases[phaseId].stages[stageId]) {
      phases[phaseId].stages[stageId] = {
        score: 0,
        status: STATUS.MISSING,
        systemCount: 0,
        statusCounts: createStatusCounter(),
        systems: []
      };
    }

    const stage = phases[phaseId].stages[stageId];
    stage.systems.push({
      system: systemId,
      status: entry.status,
      score: entry.score,
      critical: entry.critical,
      group: entry.group
    });
    stage.systemCount += 1;
    stage.statusCounts[entry.status] += 1;

    const phase = phases[phaseId];
    phase.systemCount += 1;
    phase.statusCounts[entry.status] += 1;
  }

  for (const phase of Object.values(phases)) {
    for (const stage of Object.values(phase.stages)) {
      stage.systems.sort((a, b) => a.system.localeCompare(b.system));
      stage.score = average(stage.systems.map((entry) => entry.score));
      stage.status = scoreToStatus(stage.score);
    }

    phase.score = average(
      Object.values(phase.stages).map((stage) => stage.score)
    );
    phase.status = scoreToStatus(phase.score);
  }

  return {
    generatedAt: new Date().toISOString(),
    phases
  };
}

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function createStatusCounter() {
  return {
    [STATUS.MISSING]: 0,
    [STATUS.SCAFFOLDED]: 0,
    [STATUS.PARTIAL]: 0,
    [STATUS.INTEGRATED]: 0,
    [STATUS.VERIFIED]: 0
  };
}

export function scoreBar(score) {
  const filled = Math.round(score / 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}

export { ARCH_DIR, REPORTS_DIR };
