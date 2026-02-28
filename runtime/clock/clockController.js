import { clock } from './clock.js';
import { evaluateFrameAt } from '../../engine/evaluation/evaluateFrameAt.js';
import { getRuntimeState } from '../state/runtimeState.js';
import { buildEvaluationInputs } from '../animation/buildEvaluationInputs.js';

let rafId = null;

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

    const runtime = getRuntimeState();
    const { sceneGraphTree, shotTimeline, activeShotId, cameraTransform } =
        buildEvaluationInputs(runtime);

    evaluateFrameAt(clock.time, {
        reason: 'clock-tick',
        sceneGraph: sceneGraphTree,
        shotTimeline,
        activeShotId,
        cameraTransform,
    });

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
    const runtime = getRuntimeState();
    const { sceneGraphTree, shotTimeline, activeShotId, cameraTransform } =
        buildEvaluationInputs(runtime);

    evaluateFrameAt(clock.time, {
        reason: 'seek',
        sceneGraph: sceneGraphTree,
        shotTimeline,
        activeShotId,
        cameraTransform,
    });
}
