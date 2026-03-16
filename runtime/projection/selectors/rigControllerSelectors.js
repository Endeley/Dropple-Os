function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

function getDocumentRigs(document) {
    if (Array.isArray(document?.rigs)) return document.rigs;

    const rigs = document?.rigs?.rigs;
    return rigs && typeof rigs === 'object' ? Object.values(rigs) : [];
}

function getRigControllers(rig) {
    if (Array.isArray(rig?.controllers)) return rig.controllers;

    const controllers = rig?.controllers;
    return controllers && typeof controllers === 'object' ? Object.values(controllers) : [];
}

export function getControllerChannels(controller) {
    if (!controller || typeof controller !== 'object') return [];

    const { channels } = controller;
    if (Array.isArray(channels)) return channels;
    if (channels && typeof channels === 'object') return Object.keys(channels);

    return [];
}

function normalizeKeyframe(keyframe, index, trackId) {
    const time = Number(keyframe?.time ?? keyframe?.frame ?? keyframe?.t ?? 0);

    return {
        id: keyframe?.id ?? `${trackId}-keyframe-${index}-${time}`,
        time,
        frame: Number(keyframe?.frame ?? time),
        value: keyframe?.value ?? keyframe?.v ?? 0,
        easing: keyframe?.easing ?? keyframe?.interpolation ?? 'linear',
        interpolation: keyframe?.interpolation ?? keyframe?.easing ?? 'linear',
        handleIn: keyframe?.handleIn ?? null,
        handleOut: keyframe?.handleOut ?? null,
    };
}

export function getMotionChannel(documentMotion, nodeId, channel) {
    if (!documentMotion || !nodeId || !channel) return [];

    const nodeMotion = documentMotion[nodeId];
    if (!nodeMotion || typeof nodeMotion !== 'object') return [];

    const channelMotion = nodeMotion[channel];
    if (!channelMotion || typeof channelMotion !== 'object') return [];

    return safeArray(channelMotion.keyframes)
        .map((keyframe, index) =>
            normalizeKeyframe(
                keyframe,
                index,
                `controller-motion:${nodeId}:${channel}`
            )
        )
        .sort((left, right) => {
            const timeDelta = Number(left?.time ?? 0) - Number(right?.time ?? 0);
            if (timeDelta !== 0) return timeDelta;
            return stableCompare(left?.id, right?.id);
        });
}

export function projectControllerChannelTrack({
    rigId,
    controllerId,
    nodeId,
    channel,
    documentMotion,
}) {
    const keyframes = getMotionChannel(documentMotion, nodeId, channel);

    return {
        id: `controller:${controllerId}:${channel}`,
        kind: 'motion-channel',
        rigId,
        controllerId,
        nodeId,
        channel,
        property: channel,
        keyframes,
    };
}

export function projectControllerGroup({
    rigId,
    controller,
    documentMotion,
}) {
    const controllerId = controller?.id ?? null;
    const nodeId = controller?.nodeId ?? controller?.nodeRef ?? null;
    const channels = getControllerChannels(controller);

    return {
        id: `controller:${controllerId}`,
        kind: 'controller-group',
        label: controller?.label || controllerId,
        rigId,
        controllerId,
        nodeId,
        tracks: channels.map((channel) =>
            projectControllerChannelTrack({
                rigId,
                controllerId,
                nodeId,
                channel,
                documentMotion,
            })
        ),
    };
}

export function projectRigGroup({
    rig,
    documentMotion,
}) {
    const rigId = rig?.id ?? null;
    const controllers = getRigControllers(rig);

    return {
        id: `rig:${rigId}`,
        kind: 'rig-group',
        label: rig?.label || rigId,
        rigId,
        tracks: controllers.map((controller) =>
            projectControllerGroup({
                rigId,
                controller,
                documentMotion,
            })
        ),
    };
}

export function projectRigControllerTimelineTracks(runtimeSnapshot) {
    if (!runtimeSnapshot || typeof runtimeSnapshot !== 'object') return [];

    const document = runtimeSnapshot.document || {};
    const rigs = getDocumentRigs(document);
    const motion = document.motion || {};

    return rigs.map((rig) =>
        projectRigGroup({
            rig,
            documentMotion: motion,
        })
    );
}

export function selectActiveRigController(snapshot, selection) {
    if (!selection?.controllerId) return null;

    const rigs = getDocumentRigs(snapshot?.document);

    for (const rig of rigs) {
        const controller = getRigControllers(rig).find(
            (entry) => entry?.id === selection.controllerId
        );

        if (controller) return controller;
    }

    return null;
}
