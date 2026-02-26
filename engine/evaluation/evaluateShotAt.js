import { evaluateScene } from './evaluateScene.js';
import { evaluateTimeline } from '../timeline/evaluateTimeline.js';

function toFiniteNumber(value, label) {
    if (!Number.isFinite(value)) {
        throw new Error(`evaluateShotAt: ${label} must be a finite number`);
    }
    return value;
}

function assertTransformInvariant(transform, label) {
    if (transform == null) return;
    if (typeof transform !== 'object') {
        throw new Error(`evaluateShotAt: ${label} must be an object when provided`);
    }
    if ('x' in transform) {
        const x = transform.x;
        const isNumber = Number.isFinite(x);
        const isKeyframes = Boolean(x && typeof x === 'object' && 'keyframes' in x);
        if (!isNumber && !isKeyframes) {
            throw new Error(
                `evaluateShotAt: ${label}.x must be a finite number or keyframes when provided`
            );
        }
    }
    if ('y' in transform) {
        const y = transform.y;
        const isNumber = Number.isFinite(y);
        const isKeyframes = Boolean(y && typeof y === 'object' && 'keyframes' in y);
        if (!isNumber && !isKeyframes) {
            throw new Error(
                `evaluateShotAt: ${label}.y must be a finite number or keyframes when provided`
            );
        }
    }
}

function validateTimeline(shotTimeline) {
    if (!shotTimeline || typeof shotTimeline !== 'object') {
        throw new Error('evaluateShotAt: shotTimeline must be an object');
    }
    const shots = shotTimeline.shots;
    if (!Array.isArray(shots)) {
        throw new Error('evaluateShotAt: shotTimeline.shots must be an array');
    }

    let lastEnd = -Infinity;
    for (let i = 0; i < shots.length; i += 1) {
        const shot = shots[i];
        if (!shot || typeof shot !== 'object') {
            throw new Error('evaluateShotAt: shot must be an object');
        }
        if (typeof shot.id !== 'string' || shot.id.length === 0) {
            throw new Error('evaluateShotAt: shot.id must be a non-empty string');
        }
        const startMs = toFiniteNumber(shot.startMs, 'shot.startMs');
        const endMs = toFiniteNumber(shot.endMs, 'shot.endMs');
        if (startMs >= endMs) {
            throw new Error('evaluateShotAt: shot.startMs must be less than shot.endMs');
        }
        if (startMs < lastEnd) {
            throw new Error('evaluateShotAt: shots must be sorted by startMs and non-overlapping');
        }
        lastEnd = endMs;

        if (shot.timeOffsetMs != null) {
            toFiniteNumber(shot.timeOffsetMs, 'shot.timeOffsetMs');
        }

        assertTransformInvariant(shot.cameraTransform, 'shot.cameraTransform');
    }

    if (shotTimeline.activeShotId != null && typeof shotTimeline.activeShotId !== 'string') {
        throw new Error('evaluateShotAt: shotTimeline.activeShotId must be a string when provided');
    }
}

function selectShot(shotTimeline, timeMs, options) {
    const { shotId } = options || {};
    const shots = shotTimeline.shots || [];

    if (shotId) {
        const explicit = shots.find((shot) => shot.id === shotId);
        if (!explicit) {
            throw new Error(`evaluateShotAt: shotId not found: ${shotId}`);
        }
        return explicit;
    }

    if (shotTimeline.activeShotId) {
        const active = shots.find((shot) => shot.id === shotTimeline.activeShotId);
        if (!active) {
            throw new Error(`evaluateShotAt: activeShotId not found: ${shotTimeline.activeShotId}`);
        }
        return active;
    }

    return shots.find((shot) => timeMs >= shot.startMs && timeMs < shot.endMs) || null;
}

function clampShotTime(timeMs, shot) {
    const duration = shot.endMs - shot.startMs;
    let shotTimeMs = timeMs - shot.startMs;
    if (shot.timeOffsetMs != null) {
        shotTimeMs += shot.timeOffsetMs;
    }
    if (shotTimeMs < 0) return 0;
    if (shotTimeMs > duration) return duration;
    return shotTimeMs;
}

function resolveChannelValue(channel, timeMs, label) {
    if (channel == null) return null;
    if (Number.isFinite(channel)) return channel;
    if (channel && typeof channel === 'object' && Array.isArray(channel.keyframes)) {
        const { keyframes } = channel;
        if (keyframes.length < 1) {
            throw new Error(`evaluateShotAt: ${label} keyframes must have at least one entry`);
        }
        let lastTime = -Infinity;
        for (const frame of keyframes) {
            if (!frame || typeof frame !== 'object') {
                throw new Error(`evaluateShotAt: ${label} keyframes must be objects`);
            }
            const time = frame.t ?? frame.time;
            const value = frame.v ?? frame.value;
            if (!Number.isFinite(time) || !Number.isFinite(value)) {
                throw new Error(`evaluateShotAt: ${label} keyframes require finite time and value`);
            }
            const easing = frame.easing ?? 'linear';
            if (easing !== 'linear' && easing !== 'easeInOut') {
                throw new Error(`evaluateShotAt: ${label} keyframes easing must be linear or easeInOut`);
            }
            if (time <= lastTime) {
                throw new Error(`evaluateShotAt: ${label} keyframes must be strictly ascending`);
            }
            lastTime = time;
        }

        const first = keyframes[0];
        const lastFrame = keyframes[keyframes.length - 1];
        const firstTime = first.t ?? first.time;
        const lastTimeValue = lastFrame.t ?? lastFrame.time;
        const firstValue = first.v ?? first.value;
        const lastValue = lastFrame.v ?? lastFrame.value;

        if (timeMs <= firstTime) return firstValue;
        if (timeMs >= lastTimeValue) return lastValue;

        for (let i = 0; i < keyframes.length - 1; i += 1) {
            const k1 = keyframes[i];
            const k2 = keyframes[i + 1];
            const t1 = k1.t ?? k1.time;
            const t2 = k2.t ?? k2.time;
            if (timeMs >= t1 && timeMs <= t2) {
                const span = t2 - t1;
                const ratio = span === 0 ? 0 : (timeMs - t1) / span;
                const clamped = Math.max(0, Math.min(1, ratio));
                const easing = k2.easing ?? 'linear';
                const eased =
                    easing === 'easeInOut'
                        ? clamped * clamped * (3 - 2 * clamped)
                        : clamped;
                const v1 = k1.v ?? k1.value;
                const v2 = k2.v ?? k2.value;
                return v1 + eased * (v2 - v1);
            }
        }
    }

    if (channel && typeof channel === 'object' && 'value' in channel) {
        if (!Number.isFinite(channel.value)) {
            throw new Error(`evaluateShotAt: ${label} value must be a finite number`);
        }
        return channel.value;
    }

    throw new Error(`evaluateShotAt: ${label} must be a number or keyframes`);
}

function applyResolvedChannelsToRuntime(node, resolvedChannels) {
    if (!node || typeof node !== 'object') return node;

    const next = { ...node };
    const childrenIn = Array.isArray(node.children) ? node.children : [];
    const children = childrenIn.map((child) => applyResolvedChannelsToRuntime(child, resolvedChannels));
    next.children = children;

    const baseChannels = node.channels && typeof node.channels === 'object' ? node.channels : {};
    const nextChannels = { ...baseChannels };
    const keys = Object.keys(resolvedChannels).sort();
    for (const key of keys) {
        nextChannels[key] = { value: resolvedChannels[key] };
    }
    next.channels = nextChannels;

    return next;
}

export function evaluateShotAt(shotTimeline, sceneGraph, timeMs, options = {}) {
    validateTimeline(shotTimeline);
    if (!Number.isFinite(timeMs)) {
        throw new Error('evaluateShotAt: timeMs must be a finite number');
    }

    const shot = selectShot(shotTimeline, timeMs, options);
    if (!shot) {
        return { ok: false, reason: 'NO_SHOT', timeMs };
    }

    const shotTimeMs = clampShotTime(timeMs, shot);
    const cameraTransform = shot.cameraTransform ?? options.cameraTransform ?? null;
    assertTransformInvariant(cameraTransform, 'cameraTransform');

    let graphForEval = sceneGraph;
    if (shot.timeline) {
        const evaluateChannel = (channelId, time) => {
            const channel = (shot.timeline.channels || []).find((c) => c.id === channelId);
            if (!channel) return undefined;
            return resolveChannelValue(channel, time, `channel:${channelId}`);
        };
        const blend = (a, b) => (Number.isFinite(a) && Number.isFinite(b) ? a + b : b);
        const resolved = evaluateTimeline(shot.timeline, shotTimeMs, evaluateChannel, blend);
        graphForEval = applyResolvedChannelsToRuntime(sceneGraph, resolved);
    }

    const evaluatedScene = evaluateScene(graphForEval, shotTimeMs, { cameraTransform });

    return {
        ok: true,
        shotId: shot.id,
        timeMs,
        shotTimeMs,
        evaluatedScene,
    };
}
