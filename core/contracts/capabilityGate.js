export function checkWorkspacePolicy({
  workspace,
  requiredCaps = [],
  mutationType = 'mutate',
}) {
  const policy = workspace?.policy;
  if (!policy) return { ok: false, reason: 'NO_POLICY' };

  // Mutation policy hard block
  if (policy.mutation === 'readonly' && mutationType !== 'select') {
    return { ok: false, reason: 'READONLY_WORKSPACE' };
  }

  if (policy.mutation === 'guarded' && mutationType !== 'select') {
    const gates = workspace?.gates ?? {};
    if (!gates.validationGate) {
      return { ok: false, reason: 'GUARDED_WORKSPACE' };
    }
  }

  // Explicit denies win
  const denies = new Set(policy.denies ?? []);
  for (const cap of requiredCaps) {
    if (denies.has(cap)) return { ok: false, reason: 'DENIED', cap };
  }

  // Must have all required caps
  const caps = new Set(policy.capabilities ?? []);
  for (const cap of requiredCaps) {
    if (!caps.has(cap)) return { ok: false, reason: 'MISSING_CAP', cap };
  }

  return { ok: true };
}
