import { createOutcome, isPlainObject } from './common.mjs';

const DURATION_REGRESSION_THRESHOLD = 1.4;

export function compareOsSurfaceShellRuntimeProbe({
    baseline,
    current,
} = {}) {
    const outcomes = [];

    if (!isPlainObject(current)) {
        outcomes.push(createOutcome({
            ok: false,
            severity: 'error',
            invariant: 'osSurfaceShellRuntimeProbe.presence',
            classification: 'constitutional-regression',
            message: 'os surface shell runtime probe check is missing in current report.',
        }));
        return Object.freeze(outcomes);
    }

    const required = current.required === true;
    const skipped = current.skipped === true;
    const probeOk = current.ok === true;

    outcomes.push(createOutcome({
        ok: !required || skipped === false,
        severity: !required || skipped === false ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.required-not-skipped',
        classification: !required || skipped === false ? 'lawful-evolution' : 'constitutional-regression',
        message: !required || skipped === false
            ? 'runtime probe requirement state is valid.'
            : 'runtime probe is required but was skipped.',
    }));

    outcomes.push(createOutcome({
        ok: probeOk || skipped,
        severity: probeOk || skipped ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.ok',
        classification: probeOk || skipped ? 'lawful-evolution' : 'constitutional-regression',
        message: probeOk
            ? 'runtime probe passed.'
            : skipped
                ? 'runtime probe skipped by policy.'
                : 'runtime probe failed.',
    }));

    const failureReasonValid =
        skipped ||
        probeOk ||
        (typeof current.reason === 'string' && current.reason.trim().length > 0);
    outcomes.push(createOutcome({
        ok: failureReasonValid,
        severity: failureReasonValid ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.failureReason',
        classification: failureReasonValid ? 'lawful-evolution' : 'constitutional-regression',
        message: failureReasonValid
            ? `runtime probe failure reason: ${current.reason ?? 'none'}.`
            : 'runtime probe failed without a classified failure reason.',
    }));

    const publishClickable = current.publishClickable === true;
    outcomes.push(createOutcome({
        ok: skipped || publishClickable,
        severity: skipped || publishClickable ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.publishClickable',
        classification: skipped || publishClickable ? 'lawful-evolution' : 'constitutional-regression',
        message: skipped || publishClickable
            ? 'publish flow clickability is preserved.'
            : 'publish flow clickability probe failed.',
    }));

    const keyframeClickable = current.keyframeClickable === true;
    outcomes.push(createOutcome({
        ok: skipped || keyframeClickable,
        severity: skipped || keyframeClickable ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.keyframeClickable',
        classification: skipped || keyframeClickable ? 'lawful-evolution' : 'constitutional-regression',
        message: skipped || keyframeClickable
            ? 'keyframe flow clickability is preserved.'
            : 'keyframe flow clickability probe failed.',
    }));

    const interceptErrorFree = Number.isFinite(current.interceptErrors) && Number(current.interceptErrors) === 0;
    outcomes.push(createOutcome({
        ok: skipped || interceptErrorFree,
        severity: skipped || interceptErrorFree ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.interceptErrors',
        classification: skipped || interceptErrorFree ? 'lawful-evolution' : 'constitutional-regression',
        message: skipped || interceptErrorFree
            ? 'runtime probe observed no pointer-event interception errors.'
            : `runtime probe observed ${Number(current.interceptErrors)} pointer-event interception errors.`,
    }));

    const currentDurationValid = Number.isFinite(current.durationMs) && Number(current.durationMs) >= 0;
    outcomes.push(createOutcome({
        ok: currentDurationValid,
        severity: currentDurationValid ? 'info' : 'error',
        invariant: 'osSurfaceShellRuntimeProbe.durationMs',
        classification: currentDurationValid ? 'lawful-evolution' : 'constitutional-regression',
        message: currentDurationValid
            ? `runtime probe duration recorded (${Number(current.durationMs)}ms).`
            : 'runtime probe duration is missing or invalid.',
    }));

    const baselineDurationValid = Number.isFinite(baseline?.durationMs) && Number(baseline.durationMs) > 0;
    if (baselineDurationValid && currentDurationValid && skipped !== true) {
        const baselineDuration = Number(baseline.durationMs);
        const currentDuration = Number(current.durationMs);
        const ratio = currentDuration / baselineDuration;
        const regressionExceeded = ratio > DURATION_REGRESSION_THRESHOLD;
        outcomes.push(createOutcome({
            ok: true,
            severity: regressionExceeded ? 'warning' : 'info',
            invariant: 'osSurfaceShellRuntimeProbe.duration-regression',
            classification: regressionExceeded ? 'semantic-drift' : 'lawful-evolution',
            message: regressionExceeded
                ? `runtime probe duration regressed (${baselineDuration}ms -> ${currentDuration}ms, ${(ratio * 100).toFixed(1)}%).`
                : `runtime probe duration within threshold (${baselineDuration}ms -> ${currentDuration}ms).`,
        }));
    }

    return Object.freeze(outcomes);
}
