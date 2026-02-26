import crypto from 'crypto';
import { normalizeTimeline, hashTimeline } from '../../domain/timeline/TimelineContract.js';
import { diffTimeline } from '../timeline/diffTimeline.js';
import { evaluateShotAt } from '../evaluation/evaluateShotAt.js';
import { hashEvaluatedScene } from '../evaluation/hashFrame.js';

function buildEvaluationHash({
    frames,
    shotTimeline,
    sceneGraph,
    activeShotId,
    evaluateShotAtFn,
    hashEvaluatedSceneFn,
}) {
    const hashes = [];
    for (const timeMs of frames) {
        const result = evaluateShotAtFn(shotTimeline, sceneGraph, timeMs, {
            shotId: activeShotId ?? null,
        });
        const evaluatedScene = result?.evaluatedScene ?? null;
        const frameHash = hashEvaluatedSceneFn(evaluatedScene);
        hashes.push(frameHash);
    }

    return crypto.createHash('sha256').update(hashes.join('|')).digest('hex');
}

export function runExportStabilityGate({
    timeline,
    shotTimeline,
    sceneGraph,
    presentHash = null,
    activeShotId = null,
    frames = [0, 33, 66, 99],
    evaluateShotAtFn = evaluateShotAt,
    hashEvaluatedSceneFn = hashEvaluatedScene,
} = {}) {
    const normalized = normalizeTimeline(timeline);
    const timelineHash = hashTimeline(normalized);

    if (presentHash && presentHash !== timelineHash) {
        return {
            allowed: false,
            timelineHash,
            evaluationHash: '',
            structuralDrift: true,
            evaluationDrift: false,
            diff: diffTimeline(normalized, timeline),
            reason: 'Structural drift detected',
        };
    }

    const evalHashA = buildEvaluationHash({
        frames,
        shotTimeline,
        sceneGraph,
        activeShotId,
        evaluateShotAtFn,
        hashEvaluatedSceneFn,
    });

    const evalHashB = buildEvaluationHash({
        frames,
        shotTimeline,
        sceneGraph,
        activeShotId,
        evaluateShotAtFn,
        hashEvaluatedSceneFn,
    });

    if (evalHashA !== evalHashB) {
        return {
            allowed: false,
            timelineHash,
            evaluationHash: evalHashA,
            structuralDrift: false,
            evaluationDrift: true,
            reason: 'Evaluation nondeterminism detected',
        };
    }

    const postHash = hashTimeline(normalized);
    if (postHash !== timelineHash) {
        return {
            allowed: false,
            timelineHash,
            evaluationHash: evalHashA,
            structuralDrift: true,
            evaluationDrift: false,
            reason: 'Timeline mutated during evaluation',
        };
    }

    return {
        allowed: true,
        timelineHash,
        evaluationHash: evalHashA,
        structuralDrift: false,
        evaluationDrift: false,
    };
}
