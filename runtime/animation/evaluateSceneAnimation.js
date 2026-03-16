import { evaluateAnimationFrame } from './evaluateAnimationFrame.js';
import { evaluateRig } from '../rigging/evaluation/evaluateRig.js';
import { lerp, safeNumber } from './blending/blendUtils.js';

function getDocumentRigs(document) {
    if (Array.isArray(document?.rigs)) return document.rigs;

    const rigs = document?.rigs?.rigs;
    return rigs && typeof rigs === 'object' ? Object.values(rigs) : [];
}

function getRigControllers(rig) {
    if (Array.isArray(rig?.controllers)) return rig.controllers;

    const controllers = rig?.controllers;
    return controllers && typeof controllers === 'object'
        ? Object.values(controllers)
        : [];
}

function getControllerChannels(controller) {
    if (Array.isArray(controller?.channels)) return controller.channels;

    const channels = controller?.channels;
    return channels && typeof channels === 'object' ? Object.keys(channels) : [];
}

function getCurrentFrame(snapshot, context) {
    if (Number.isFinite(context?.frame)) return Number(context.frame);
    if (Number.isFinite(context?.time)) return Number(context.time);
    if (Number.isFinite(context?.timeMs)) return Number(context.timeMs);
    if (Number.isFinite(snapshot?.frame)) return Number(snapshot.frame);
    if (Number.isFinite(snapshot?.cursorIndex)) return Number(snapshot.cursorIndex);
    if (Number.isFinite(snapshot?.playback?.frame)) return Number(snapshot.playback.frame);
    if (Number.isFinite(snapshot?.playback?.time)) return Number(snapshot.playback.time);
    return 0;
}

function sampleKeyframes(keyframes, frame) {
    const ordered = (Array.isArray(keyframes) ? keyframes : [])
        .slice()
        .sort(
            (left, right) =>
                safeNumber(left?.frame ?? left?.time ?? left?.t) -
                safeNumber(right?.frame ?? right?.time ?? right?.t)
        );

    if (!ordered.length) return null;

    const firstFrame = safeNumber(ordered[0]?.frame ?? ordered[0]?.time ?? ordered[0]?.t);
    if (frame <= firstFrame) return safeNumber(ordered[0]?.value ?? ordered[0]?.v);

    for (let index = 1; index < ordered.length; index += 1) {
        const previous = ordered[index - 1];
        const current = ordered[index];
        const previousFrame = safeNumber(previous?.frame ?? previous?.time ?? previous?.t);
        const currentFrame = safeNumber(current?.frame ?? current?.time ?? current?.t);

        if (frame > currentFrame) continue;
        if (currentFrame <= previousFrame) {
            return safeNumber(current?.value ?? current?.v);
        }

        const t = (frame - previousFrame) / (currentFrame - previousFrame);
        return lerp(
            safeNumber(previous?.value ?? previous?.v),
            safeNumber(current?.value ?? current?.v),
            t
        );
    }

    const last = ordered[ordered.length - 1];
    return safeNumber(last?.value ?? last?.v);
}

function buildRigMotionClip({ rig, motion, frame }) {
    const channels = [];

    for (const controller of getRigControllers(rig)) {
        const controllerId = controller?.id ?? null;
        const nodeId = controller?.nodeId ?? controller?.nodeRef ?? null;
        if (!controllerId || !nodeId) continue;

        const nodeMotion = motion?.[nodeId];
        if (!nodeMotion || typeof nodeMotion !== 'object') continue;

        for (const channel of getControllerChannels(controller)) {
            const keyframes = nodeMotion?.[channel]?.keyframes;
            const value = sampleKeyframes(keyframes, frame);
            if (value == null) continue;

            channels.push({
                controllerId,
                channel,
                value,
            });
        }
    }

    if (!channels.length) return [];

    return [
        {
            id: `rig-motion:${rig?.id ?? 'unknown'}:${frame}`,
            rigId: rig?.id ?? null,
            mode: 'replace',
            weight: 1,
            channels,
        },
    ];
}

function getSceneNodeTransforms(scene) {
    const computed = scene?.computed ?? {};
    const explicit = computed?.transforms;
    if (explicit && typeof explicit === 'object') return explicit;

    const transforms = {};

    for (const [nodeId, entry] of Object.entries(computed)) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
        transforms[nodeId] = {
            x: safeNumber(entry?.x),
            y: safeNumber(entry?.y),
        };
    }

    return transforms;
}

export function evaluateSceneAnimation(snapshot, context = {}) {
    const document = snapshot?.document || {};
    const runtime = snapshot?.runtime || snapshot || {};
    const rigs = getDocumentRigs(document);
    const motion = document?.motion || {};
    const frame = getCurrentFrame(snapshot, context);
    const sceneNodeTransforms = getSceneNodeTransforms(runtime?.scene);
    const animationRuntime = runtime?.animation || {};
    const transforms = {};

    for (const rig of rigs) {
        const rigId = rig?.id ?? null;
        if (!rigId) continue;

        const sampledTimelineClips = buildRigMotionClip({
            rig,
            motion,
            frame,
        });

        const animationFrame = evaluateAnimationFrame({
            ...runtime,
            snapshot,
            rigId,
            animation: {
                ...animationRuntime,
                timelineClips: [
                    ...sampledTimelineClips,
                    ...(animationRuntime?.timelineClips || []),
                ],
            },
        });

        const rigResult = evaluateRig({
            rig,
            controllerValues: animationFrame?.controllerValues || {},
            nodeTransforms: sceneNodeTransforms,
        });

        Object.assign(transforms, rigResult?.constrainedNodes || {});
    }

    return transforms;
}
