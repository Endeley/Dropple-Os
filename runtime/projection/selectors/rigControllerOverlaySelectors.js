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

function getComputedTransform(sceneComputed, nodeId) {
    if (!sceneComputed || !nodeId) return null;

    const transforms = sceneComputed.transforms || sceneComputed;
    return transforms && typeof transforms === 'object' ? transforms[nodeId] ?? null : null;
}

export function projectControllerOverlay({
    rigId,
    controller,
    sceneComputed,
}) {
    const controllerId = controller?.id ?? null;
    const nodeId = controller?.nodeId ?? controller?.nodeRef ?? null;

    if (!controllerId || !nodeId) return null;

    const transform = getComputedTransform(sceneComputed, nodeId);
    if (!transform) return null;

    return {
        id: `controller-overlay:${controllerId}`,
        kind: 'rig-controller-overlay',
        rigId,
        controllerId,
        nodeId,
        label: controller?.label || controllerId,
        x: Number(transform?.x ?? 0),
        y: Number(transform?.y ?? 0),
        rotation: Number(transform?.rotation ?? 0),
        visible: true,
    };
}

export function projectRigControllerOverlays({
    rig,
    sceneComputed,
}) {
    return getRigControllers(rig)
        .map((controller) =>
            projectControllerOverlay({
                rigId: rig?.id ?? null,
                controller,
                sceneComputed,
            })
        )
        .filter(Boolean);
}

export function projectRigControllerOverlayNodes(runtimeSnapshot) {
    if (!runtimeSnapshot || typeof runtimeSnapshot !== 'object') return [];

    const document = runtimeSnapshot.document || {};
    const sceneComputed = runtimeSnapshot.runtime?.scene?.computed ?? runtimeSnapshot.scene?.computed;
    const rigs = getDocumentRigs(document);

    return rigs.flatMap((rig) =>
        projectRigControllerOverlays({
            rig,
            sceneComputed,
        })
    );
}
