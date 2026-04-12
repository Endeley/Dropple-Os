import { clock } from './clock.js';
import { evaluateFrameAt } from '../../engine/evaluation/evaluateFrameAt.js';
import { hashEvaluatedScene } from '../../engine/evaluation/hashFrame.js';
import { getRuntimeState } from '../state/runtimeState.js';
import { buildEvaluationInputs } from '../animation/buildEvaluationInputs.js';
import { evaluateTransitionFrame } from '../transition/evaluateTransitionFrame.js';
import { useRuntimeStore } from '../stores/useRuntimeStore.js';

let rafId = null;

function evaluateClockFrame(timeMs, reason) {
    const runtime = getRuntimeState();
    const { sceneGraphTree, activeSceneId, shotTimeline, activeShotId, cameraTransform } =
        buildEvaluationInputs(runtime, { timeMs, strictSceneScope: true });
    const result = evaluateTransitionFrame({
        shotTimeline,
        sceneGraph: runtime?.document?.sceneGraph ?? null,
        activeSceneId,
        activeShotId,
        timeMs,
        cameraTransform,
        strictSceneScope: true,
    });
    const transitionWindow = result?.transitionWindow ?? null;

    if (!transitionWindow) {
        return evaluateFrameAt(timeMs, {
            reason,
            sceneGraph: sceneGraphTree,
            shotTimeline,
            activeShotId,
            cameraTransform,
        });
    }

    const frameHash = process.env.NODE_ENV !== 'production' ? hashEvaluatedScene(result.evaluatedScene) : null;

    useRuntimeStore.setState(
        {
            frameTime: timeMs,
            evaluatedScene: result.evaluatedScene,
            frameHash,
            shotId: result.shotId,
            shotTimeMs: result.shotTimeMs,
            evalStatus: result.ok ? 'OK' : 'NO_SHOT',
        },
        false,
    );

    return {
        frameTime: timeMs,
        frameHash,
        shotId: result.shotId ?? null,
        shotTimeMs: result.shotTimeMs ?? null,
        evalStatus: result.ok ? 'OK' : 'NO_SHOT',
        evaluatedScene: result.evaluatedScene,
        reason,
    };
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
