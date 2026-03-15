const EMPTY_RIG_STATE = Object.freeze({
    rigs: Object.freeze({}),
    activeRigId: null,
});

function stableCompare(left, right) {
    return String(left ?? '').localeCompare(String(right ?? ''));
}

export function selectRigState(state) {
    return state?.document?.rigs ?? EMPTY_RIG_STATE;
}

export function selectRigMap(state) {
    return selectRigState(state).rigs ?? EMPTY_RIG_STATE.rigs;
}

export function selectActiveRigId(state) {
    return selectRigState(state).activeRigId ?? null;
}

export function selectActiveRig(state) {
    const rigs = selectRigMap(state);
    const activeRigId = selectActiveRigId(state);
    return activeRigId ? rigs[activeRigId] ?? null : null;
}

export function projectRigs(rigState) {
    return Object.values(rigState?.rigs || {}).sort((left, right) => stableCompare(left?.id, right?.id));
}

export function projectRigControllers(rig) {
    return Object.values(rig?.controllers || {}).sort((left, right) => stableCompare(left?.id, right?.id));
}

export function projectRigConstraints(rig) {
    return Object.values(rig?.constraints || {}).sort((left, right) => stableCompare(left?.id, right?.id));
}

export function projectRigTimelineTracks(rig) {
    return projectRigControllers(rig).flatMap((controller) =>
        (controller.channels || []).map((channel) => ({
            id: `${controller.id}:${channel}`,
            controllerId: controller.id,
            nodeId: controller.nodeRef ?? null,
            property: channel,
            label: `${controller.label || controller.id} / ${channel}`,
        }))
    );
}

function normalizeMotionKeyframe(keyframe, index, trackId) {
    const time = Number(keyframe?.time ?? keyframe?.t ?? 0);

    return {
        id: keyframe?.id ?? `${trackId}-keyframe-${index}-${time}`,
        time,
        value: keyframe?.value ?? keyframe?.v ?? 0,
        easing: keyframe?.easing ?? keyframe?.interpolation ?? 'linear',
        interpolation: keyframe?.interpolation ?? keyframe?.easing ?? 'linear',
        handleIn: keyframe?.handleIn ?? null,
        handleOut: keyframe?.handleOut ?? null,
    };
}

export function projectRigControllerTimelineTracks(rig, motion) {
    const clips = Object.values(motion?.clips || {});

    return projectRigControllers(rig).flatMap((controller) =>
        (controller.channels || []).map((channel) => {
            const clip = clips.find(
                (entry) =>
                    entry?.target === controller.nodeRef &&
                    entry?.property === channel
            );
            const trackId = `${controller.id}:${channel}`;

            return {
                id: trackId,
                controllerId: controller.id,
                controllerLabel: controller.label || controller.id,
                nodeId: controller.nodeRef ?? null,
                property: channel,
                clipId: clip?.id ?? null,
                label: `${controller.label || controller.id} / ${channel}`,
                kind: 'rig-controller',
                keyframes: Array.isArray(clip?.keyframes)
                    ? clip.keyframes
                          .map((keyframe, index) =>
                              normalizeMotionKeyframe(keyframe, index, trackId)
                          )
                          .sort((left, right) => left.time - right.time)
                    : [],
            };
        })
    );
}

export function projectRigControllerOverlayNodes(rig, nodes) {
    return projectRigControllers(rig)
        .map((controller) => {
            const node = nodes?.[controller.nodeRef];
            const transform = node?.props?.transform ?? {};
            const x = Number(transform?.x ?? 0);
            const y = Number(transform?.y ?? 0);

            return {
                id: controller.id,
                label: controller.label || controller.id,
                nodeRef: controller.nodeRef ?? null,
                x,
                y,
            };
        })
        .sort((left, right) => stableCompare(left.label, right.label));
}
