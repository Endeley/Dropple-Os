import { compareArchitectureGate } from './architectureGateComparator.mjs';
import { compareExportVerification } from './exportVerificationComparator.mjs';
import { compareFederationAttestation } from './federationAttestationComparator.mjs';
import { compareSimulationTrace } from './simulationTraceComparator.mjs';

export const RELEASE_TRUST_REQUIRED_CHECK_IDS = Object.freeze([
    'architectureGate',
    'exportVerification',
    'federationAttestation',
    'simulationTrace',
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
        ...compareSimulationTrace({
            baseline: baselineChecks.simulationTrace,
            current: currentChecks.simulationTrace,
            strict,
        }),
    ]);
}

