import { canvasBus } from '../eventBus/canvasBus.js';
import {
    commitBridgeTimelineKeyframe,
    createSessionCommitBridgeActions,
} from '@/ui/bridges/sessionCommitRuntimeFacade.js';

let _unsub = null;

export function registerSessionCommitBridge(dispatch) {
    if (_unsub) return _unsub;

    const handler = (event) => {
        const actions = createSessionCommitBridgeActions(event);

        if (!actions) return;

        if (typeof dispatch === 'function') {
            actions.dispatchEvents.forEach((evt) => dispatch(evt));
        } else {
            console.warn('[sessionCommitBridge] Dispatch not provided; skipping dispatch.');
        }

        if (actions.timelineKeyframes.length) {
            if (typeof dispatch === 'function') {
                actions.timelineKeyframes.forEach((entry) => {
                    commitBridgeTimelineKeyframe(dispatch, entry);
                });
            } else {
                console.warn(
                    '[sessionCommitBridge] Dispatch not provided; skipping timeline keyframe commit.'
                );
            }
        }

        actions.keyframeIntents.forEach((intent) => {
            canvasBus.emit('intent.animation.keyframe.create', intent);
        });

        actions.editCommitIntents.forEach((intent) => {
            canvasBus.emit('intent.edit.commit', intent);
        });
    };

    _unsub = canvasBus.on('session.commit', handler);
    return _unsub;
}
