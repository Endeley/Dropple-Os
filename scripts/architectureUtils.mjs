import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ARCH_DIR = path.join(ROOT, 'architecture');
const REPORTS_DIR = path.join(ROOT, 'reports');

export const STATUS = {
  MISSING: 'MISSING',
  PARTIAL: 'PARTIAL',
  INTEGRATED: 'INTEGRATED'
};

export const STATUS_SCORES = {
  [STATUS.MISSING]: 0,
  [STATUS.PARTIAL]: 40,
  [STATUS.INTEGRATED]: 70
};

export function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function loadArchitectureInputs() {
  const systemMap = readJson(path.join('architecture', 'systemMap.json'));
  const dependencyGraph = readJson(path.join('architecture', 'dependencyGraph.json'));
  return { systemMap, dependencyGraph };
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
  if (statusReportExists()) {
    return readStatusReport();
  }

  const { systemMap, dependencyGraph } = loadArchitectureInputs();
  const report = buildStatusReport(systemMap, dependencyGraph);
  writeReport('reports/architecture-status.json', report);
  return report;
}

export function listMissing(paths = []) {
  return paths.filter((target) => !fileExists(target));
}

export function validateArchitectureInputs(systemMap, dependencyGraph) {
  const systemIds = new Set(Object.keys(systemMap));

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

export function buildStatusReport(systemMap, dependencyGraph) {
  validateArchitectureInputs(systemMap, dependencyGraph);
  const ordered = topologicalOrder(systemMap, dependencyGraph);
  const systems = {};

  for (const systemId of ordered) {
    const config = systemMap[systemId];
    const missingRequiredFiles = listMissing(config.requiredFiles);
    const missingRequiredTests = listMissing(config.requiredTests);
    const missingOptionalFiles = listMissing(config.optionalFiles);
    const dependencyStatuses = (dependencyGraph[systemId] ?? []).map((dependencyId) => ({
      system: dependencyId,
      status: systems[dependencyId].status
    }));
    const blockedBy = dependencyStatuses
      .filter(({ status }) => status !== STATUS.INTEGRATED)
      .map(({ system }) => system);

    let status = STATUS.INTEGRATED;

    if (missingRequiredFiles.length > 0) {
      status = STATUS.MISSING;
    } else if (
      missingRequiredTests.length > 0 ||
      missingOptionalFiles.length > 0 ||
      blockedBy.length > 0
    ) {
      status = STATUS.PARTIAL;
    }

    systems[systemId] = {
      description: config.description,
      group: config.group,
      critical: Boolean(config.critical),
      order: config.order ?? null,
      status,
      dependencies: dependencyGraph[systemId] ?? [],
      blockedBy,
      requiredFiles: config.requiredFiles,
      requiredTests: config.requiredTests,
      optionalFiles: config.optionalFiles,
      missingRequiredFiles,
      missingRequiredTests,
      missingOptionalFiles
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    statusScale: Object.values(STATUS),
    systems
  };
}

export function scoreBar(score) {
  const filled = Math.round(score / 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}

export { ARCH_DIR, REPORTS_DIR };
