import { canvasBus } from '../eventBus/canvasBus.js';

function emitAlignIntent({ nodeIds, alignment, source }) {
    if (!Array.isArray(nodeIds) || nodeIds.length < 2) return [];

    canvasBus.emit('intent.edit.begin', {
        type: 'align',
        ids: nodeIds,
        source: source || 'toolbar',
    });

    canvasBus.emit('intent.align', {
        alignment,
        nodeIds,
        source: source || 'toolbar',
    });

    canvasBus.emit('intent.edit.commit', {
        type: 'align',
        ids: nodeIds,
        source: source || 'toolbar',
    });

    return nodeIds;
}

function emitDistributeIntent({ nodeIds, axis, source }) {
    if (!Array.isArray(nodeIds) || nodeIds.length < 3) return [];

    canvasBus.emit('intent.edit.begin', {
        type: 'distribute',
        ids: nodeIds,
        source: source || 'toolbar',
    });

    canvasBus.emit('intent.distribute', {
        axis,
        nodeIds,
        source: source || 'toolbar',
    });

    canvasBus.emit('intent.edit.commit', {
        type: 'distribute',
        ids: nodeIds,
        source: source || 'toolbar',
    });

    return nodeIds;
}

export const CapabilityActions = {
    alignLeft(nodeIds, _emit) {
        return emitAlignIntent({
            nodeIds,
            alignment: 'alignLeft',
        });
    },
    alignCenterX(nodeIds, _emit) {
        return emitAlignIntent({
            nodeIds,
            alignment: 'alignCenterX',
        });
    },
    alignRight(nodeIds, _emit) {
        return emitAlignIntent({
            nodeIds,
            alignment: 'alignRight',
        });
    },
    alignTop(nodeIds, _emit) {
        return emitAlignIntent({
            nodeIds,
            alignment: 'alignTop',
        });
    },
    alignCenterY(nodeIds, _emit) {
        return emitAlignIntent({
            nodeIds,
            alignment: 'alignCenterY',
        });
    },
    alignBottom(nodeIds, _emit) {
        return emitAlignIntent({
            nodeIds,
            alignment: 'alignBottom',
        });
    },
    distributeX(nodeIds, _emit) {
        return emitDistributeIntent({
            nodeIds,
            axis: 'x',
        });
    },
    distributeY(nodeIds, _emit) {
        return emitDistributeIntent({
            nodeIds,
            axis: 'y',
        });
    },
};
