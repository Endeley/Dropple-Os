import { clock } from './clock.js';
import { getRuntimeState } from '../state/runtimeState.js';
import { buildEvaluationInputs } from '../animation/buildEvaluationInputs.js';
import { evaluateRuntimeFrame } from '../render/renderOrchestration.js';

let rafId = null;

function evaluateClockFrame(timeMs, reason) {
    const runtime = getRuntimeState();
    const inputs = buildEvaluationInputs(runtime, { timeMs, strictSceneScope: true });
    return evaluateRuntimeFrame({
        renderInput: {
            ...inputs.renderInput,
            timeMs,
        },
        timeMs,
        reason,
        commit: true,
    });
}

function tick(now) {
    if (!clock.playing) return;

    if (clock.lastTick == null) {
        clock.lastTick = now;
    }

    const rawDelta = now - clock.lastTick;
    const delta = rawDelta * (Number.isFinite(clock.speed) ? clock.speed : 1);

    clock.delta = delta;
    clock.time = Math.max(0, clock.time + delta);
    clock.lastTick = now;

    evaluateClockFrame(clock.time, 'clock-tick');

    rafId = requestAnimationFrame(tick);
}

export function play() {
    if (clock.playing) return;
    clock.playing = true;
    clock.lastTick = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
}

export function pause() {
    clock.playing = false;
    clock.delta = 0;
    clock.lastTick = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
}

export function seek(time) {
    const next = Number.isFinite(time) ? Math.max(0, time) : 0;
    clock.time = next;
    clock.delta = 0;
    clock.lastTick = null;
    evaluateClockFrame(clock.time, 'seek');
}
