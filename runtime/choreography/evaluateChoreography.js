import { lerp, safeNumber, stableCompare } from '@/runtime/animation/blending/blendUtils.js';
import { generateCombatAnimation } from './generateCombatAnimation.js';

function getCurrentFrame(snapshot) {
    if (Number.isFinite(snapshot?.frame)) return Number(snapshot.frame);
    if (Number.isFinite(snapshot?.cursorIndex)) return Number(snapshot.cursorIndex);
    if (Number.isFinite(snapshot?.playback?.frame)) return Number(snapshot.playback.frame);
    if (Number.isFinite(snapshot?.playback?.time)) return Number(snapshot.playback.time);
    return 0;
}

function sampleKeys(keys, localFrame) {
    const orderedKeys = (Array.isArray(keys) ? keys : [])
        .slice()
        .sort((left, right) => safeNumber(left?.frame) - safeNumber(right?.frame));

    if (!orderedKeys.length) return 0;
    if (localFrame <= safeNumber(orderedKeys[0]?.frame)) {
        return safeNumber(orderedKeys[0]?.value);
    }

    for (let index = 1; index < orderedKeys.length; index += 1) {
        const previous = orderedKeys[index - 1];
        const current = orderedKeys[index];
        const previousFrame = safeNumber(previous?.frame);
        const currentFrame = safeNumber(current?.frame);

        if (localFrame > currentFrame) continue;
        if (currentFrame <= previousFrame) return safeNumber(current?.value);

        const t = (localFrame - previousFrame) / (currentFrame - previousFrame);
        return lerp(
            safeNumber(previous?.value),
            safeNumber(current?.value),
            t
        );
    }

    return safeNumber(orderedKeys[orderedKeys.length - 1]?.value);
}

function projectActiveClip(clip, frame) {
    const startFrame = safeNumber(clip?.startFrame);
    const duration = Math.max(0, safeNumber(clip?.duration));
    const localFrame = frame - startFrame;

    if (localFrame < 0 || localFrame > duration) return null;

    const channels = (Array.isArray(clip?.channels) ? clip.channels : [])
        .map((channel) => {
            const controllerId = channel?.controllerId ?? null;
            const channelId = channel?.channel ?? null;
            if (!controllerId || !channelId) return null;

            return {
                controllerId,
                channel: channelId,
                value: sampleKeys(channel?.keys, localFrame),
            };
        })
        .filter(Boolean)
        .sort((left, right) => {
            const controllerDelta = stableCompare(left.controllerId, right.controllerId);
            if (controllerDelta !== 0) return controllerDelta;
            return stableCompare(left.channel, right.channel);
        });

    if (!channels.length) return null;

    return {
        id: clip?.id ?? null,
        rigId: clip?.rigId ?? null,
        participantId: clip?.participantId ?? null,
        mode: clip?.mode ?? 'replace',
        weight: safeNumber(clip?.weight ?? 1),
        startFrame,
        duration,
        channels,
    };
}

export function evaluateChoreography(snapshot) {
    const scenes = Array.isArray(snapshot?.document?.choreography?.scenes)
        ? snapshot.document.choreography.scenes
        : [];
    const frame = getCurrentFrame(snapshot);
    const generatedClips = [];

    for (const scene of scenes) {
        const participants = Object.fromEntries(
            (Array.isArray(scene?.participants) ? scene.participants : [])
                .filter((participant) => participant?.id)
                .map((participant) => [participant.id, participant])
        );

        const beats = (Array.isArray(scene?.beats) ? scene.beats : [])
            .slice()
            .sort((left, right) => {
                const timeDelta = safeNumber(left?.time) - safeNumber(right?.time);
                if (timeDelta !== 0) return timeDelta;
                return stableCompare(left?.id, right?.id);
            });

        for (const beat of beats) {
            const clips = generateCombatAnimation(beat, { participants });
            for (const clip of clips) {
                const activeClip = projectActiveClip(clip, frame);
                if (activeClip) generatedClips.push(activeClip);
            }
        }
    }

    return generatedClips.sort((left, right) => stableCompare(left?.id, right?.id));
}

