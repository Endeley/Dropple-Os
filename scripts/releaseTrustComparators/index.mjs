import { compareArchitectureGate } from './architectureGateComparator.mjs';
import { compareExportVerification } from './exportVerificationComparator.mjs';
import { compareFederationAttestation } from './federationAttestationComparator.mjs';
import { compareFederationLifecycle } from './federationLifecycleComparator.mjs';
import { compareSimulationTrace } from './simulationTraceComparator.mjs';
import { compareOsSurfaceIntentRouting } from './osSurfaceIntentRoutingComparator.mjs';
import { compareOsSurfaceShellContract } from './osSurfaceShellContractComparator.mjs';
import { compareOsSurfaceShellClickability } from './osSurfaceShellClickabilityComparator.mjs';
import { compareOsSurfaceShellRuntimeProbe } from './osSurfaceShellRuntimeProbeComparator.mjs';

export const RELEASE_TRUST_REQUIRED_CHECK_IDS = Object.freeze([
    'architectureGate',
    'exportVerification',
    'federationAttestation',
    'federationLifecycle',
    'simulationTrace',
    'osSurfaceIntentRouting',
    'osSurfaceShellContract',
    'osSurfaceShellClickability',
    'osSurfaceShellRuntimeProbe',
]);

export function compareReleaseTrustChecks({
    baselineChecks = {},
    currentChecks = {},
    strict = false,
} = {}) {
    return Object.freeze([
        ...compareArchitectureGate({
            baseline: baselineChecks.architectureGate,
            current: currentChecks.architectureGate,
        }),
        ...compareExportVerification({
            baseline: baselineChecks.exportVerification,
            current: currentChecks.exportVerification,
            strict,
        }),
        ...compareFederationAttestation({
            baseline: baselineChecks.federationAttestation,
            current: currentChecks.federationAttestation,
            strict,
        }),
        ...compareFederationLifecycle({
            baseline: baselineChecks.federationLifecycle,
            current: currentChecks.federationLifecycle,
            strict,
        }),
        ...compareSimulationTrace({
            baseline: baselineChecks.simulationTrace,
            current: currentChecks.simulationTrace,
            strict,
        }),
        ...compareOsSurfaceIntentRouting({
            baseline: baselineChecks.osSurfaceIntentRouting,
            current: currentChecks.osSurfaceIntentRouting,
            strict,
        }),
        ...compareOsSurfaceShellContract({
            baseline: baselineChecks.osSurfaceShellContract,
            current: currentChecks.osSurfaceShellContract,
            strict,
        }),
        ...compareOsSurfaceShellClickability({
            baseline: baselineChecks.osSurfaceShellClickability,
            current: currentChecks.osSurfaceShellClickability,
            strict,
        }),
        ...compareOsSurfaceShellRuntimeProbe({
            baseline: baselineChecks.osSurfaceShellRuntimeProbe,
            current: currentChecks.osSurfaceShellRuntimeProbe,
            strict,
        }),
    ]);
}
