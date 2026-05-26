const GENERATED_DRIFT_TARGETS = Object.freeze([
  `.registry/${'certifiedTemplates'}.json`,
  'reports/architecture-phase-progress.json',
  'reports/architecture-radar.json',
  'reports/architecture-score.json',
  'reports/architecture-status.json',
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GENERATED_DRIFT_TARGET_PATTERNS = Object.freeze(
  GENERATED_DRIFT_TARGETS.map((target) => new RegExp(`^${escapeRegExp(target)}$`)),
);

export { GENERATED_DRIFT_TARGETS, GENERATED_DRIFT_TARGET_PATTERNS };
