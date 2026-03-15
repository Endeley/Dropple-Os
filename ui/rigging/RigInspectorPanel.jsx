'use client';

import { useMemo } from 'react';
import {
    fieldGridStyle,
    fieldInputStyle,
    fieldLabelStyle,
    sectionStyle,
    sectionTitleStyle,
    actionButtonStyle,
} from '@/ui/workspace/media/inspector/inspectorStyles.js';

function readControllerValue(node, property) {
    const transform = node?.props?.transform ?? {};
    const normalized = String(property ?? '').toLowerCase();

    if (normalized === 'transform.x' || normalized === 'x') return Number(transform.x ?? 0);
    if (normalized === 'transform.y' || normalized === 'y') return Number(transform.y ?? 0);
    if (normalized === 'rotation') return Number(transform.rotation ?? 0);
    if (normalized === 'scale') return Number(transform.scale ?? transform.scaleX ?? 1);
    if (normalized === 'opacity') return Number(node?.props?.opacity ?? 1);

    return 0;
}

export function RigInspectorPanel({
    rig,
    controller,
    track,
    nodes,
    currentFrame,
    onCreateKeyframe,
}) {
    const node = controller?.nodeRef ? nodes?.[controller.nodeRef] ?? null : null;
    const controllerValue = useMemo(
        () => readControllerValue(node, track?.property),
        [node, track?.property]
    );
    const constraintCount = useMemo(
        () =>
            Object.values(rig?.constraints || {}).filter(
                (constraint) =>
                    constraint?.parentControllerId === controller?.id ||
                    constraint?.childNode === controller?.nodeRef
            ).length,
        [rig, controller]
    );

    if (!rig || !controller || !track) return null;

    return (
        <div style={sectionStyle()}>
            <div style={sectionTitleStyle()}>Rig Context</div>
            <div style={fieldGridStyle()}>
                <span style={fieldLabelStyle()}>Rig</span>
                <input disabled readOnly value={rig.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Controller</span>
                <input disabled readOnly value={controller.label || controller.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Node</span>
                <input disabled readOnly value={controller.nodeRef ?? 'unbound'} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Channel</span>
                <input disabled readOnly value={track.property ?? track.id} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Value</span>
                <input disabled readOnly value={String(controllerValue)} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Constraints</span>
                <input disabled readOnly value={String(constraintCount)} style={fieldInputStyle()} />
                <span style={fieldLabelStyle()}>Playhead</span>
                <input disabled readOnly value={`${currentFrame}f`} style={fieldInputStyle()} />
            </div>
            <button
                type='button'
                onClick={() => onCreateKeyframe({ value: controllerValue, time: currentFrame })}
                style={actionButtonStyle()}>
                Create Keyframe At Playhead
            </button>
        </div>
    );
}
