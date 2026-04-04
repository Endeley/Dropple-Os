import { nanoid } from 'nanoid';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';
import { getCharacterByNodeId } from '@/runtime/characters/characterRegistry.js';
import { getNodes } from '@/runtime/document/documentAdapter.js';

const attachments = new Map();
const propToAttachment = new Map();
const hostSockets = new Map();
const hostToAttachments = new Map();
const attachmentBases = new Map();

const __DEV__ = process.env.NODE_ENV !== 'production';

function snapshotLayout(node) {
    const layout = node?.layout || {};
    return {
        x: Number.isFinite(layout.x) ? layout.x : 0,
        y: Number.isFinite(layout.y) ? layout.y : 0,
        width: Number.isFinite(layout.width) ? layout.width : 0,
        height: Number.isFinite(layout.height) ? layout.height : 0,
    };
}

export function createSocket({ hostId, name, offset = null } = {}) {
    if (!hostId || !name) return null;

    const runtime = getRuntimeState();
    const host = getNodes(runtime)?.[hostId];
    if (!host?.layout) return null;

    const sockets = hostSockets.get(hostId) || {};
    if (sockets[name]) return sockets[name];

    const hostBase = snapshotLayout(host);
    const socket = {
        name,
        offset: offset || { x: 0, y: 0 },
    };

    sockets[name] = socket;
    hostSockets.set(hostId, sockets);
    return socket;
}

export function getSocketsForHost(hostId) {
    return hostSockets.get(hostId) || {};
}

export function attachProp({ hostId, propId, socketName, mode = 'follow' } = {}) {
    if (!hostId || !propId || !socketName) return null;
    if (propToAttachment.has(propId)) return null;
    if (hostToAttachments.has(propId)) {
        if (__DEV__) {
            console.warn('[Attachment] Nested attachments not supported in v1.x');
        }
        return null;
    }
    if (getCharacterByNodeId(propId)) return null;

    const runtime = getRuntimeState();
    const nodes = getNodes(runtime);
    const host = nodes[hostId];
    const prop = nodes[propId];
    if (!host?.layout || !prop?.layout) return null;

    const sockets = getSocketsForHost(hostId);
    const socket = sockets[socketName];
    if (!socket) return null;

    const id = `attach-${nanoid()}`;
    const attachment = {
        id,
        hostId,
        socket: {
            name: socket.name,
            offset: { ...socket.offset },
        },
        propId,
        mode: mode === 'lock' ? 'lock' : 'follow',
    };

    attachments.set(id, attachment);
    propToAttachment.set(propId, id);

    const list = hostToAttachments.get(hostId) || [];
    hostToAttachments.set(hostId, [...list, id]);

    attachmentBases.set(id, {
        prop: snapshotLayout(prop),
        host: snapshotLayout(host),
    });

    return attachment;
}

export function updateAttachment(attachmentId, updater) {
    const current = attachments.get(attachmentId);
    if (!current) return null;
    const next = typeof updater === 'function' ? updater(current) : updater;
    if (!next) return current;
    if (__DEV__ && next) {
        if (next.type === 'bone' || next.bone || next.ik || next.mesh || next.deform) {
            console.warn('[Animation v1] Bones/IK/deformation are not supported.');
        }
    }

    const updated = {
        ...current,
        ...next,
        socket: next.socket ? { ...current.socket, ...next.socket } : current.socket,
        mode: next.mode === 'lock' ? 'lock' : next.mode === 'follow' ? 'follow' : current.mode,
    };

    attachments.set(attachmentId, updated);

    if (updated.propId && updated.propId !== current.propId) {
        propToAttachment.delete(current.propId);
        propToAttachment.set(updated.propId, attachmentId);
    }

    if (updated.hostId && updated.hostId !== current.hostId) {
        const list = hostToAttachments.get(current.hostId) || [];
        hostToAttachments.set(
            current.hostId,
            list.filter((id) => id !== attachmentId),
        );
        const nextList = hostToAttachments.get(updated.hostId) || [];
        hostToAttachments.set(updated.hostId, [...nextList, attachmentId]);
    }

    return updated;
}

export function renameSocket(hostId, fromName, toName) {
    if (!hostId || !fromName || !toName) return false;
    const sockets = hostSockets.get(hostId) || {};
    if (!sockets[fromName] || sockets[toName]) return false;

    const socket = sockets[fromName];
    const updatedSocket = { ...socket, name: toName };
    const nextSockets = { ...sockets };
    delete nextSockets[fromName];
    nextSockets[toName] = updatedSocket;
    hostSockets.set(hostId, nextSockets);

    const attached = hostToAttachments.get(hostId) || [];
    attached.forEach((attachmentId) => {
        const attachment = attachments.get(attachmentId);
        if (!attachment || attachment.socket?.name !== fromName) return;
        attachments.set(attachmentId, {
            ...attachment,
            socket: {
                ...attachment.socket,
                name: toName,
            },
        });
    });

    return true;
}

export function detachProp(propId) {
    const attachmentId = propToAttachment.get(propId);
    if (!attachmentId) return false;

    const attachment = attachments.get(attachmentId);
    if (attachment) {
        const list = hostToAttachments.get(attachment.hostId) || [];
        hostToAttachments.set(
            attachment.hostId,
            list.filter((id) => id !== attachmentId),
        );
    }

    attachments.delete(attachmentId);
    propToAttachment.delete(propId);
    attachmentBases.delete(attachmentId);
    return true;
}

export function getAttachmentByPropId(propId) {
    const id = propToAttachment.get(propId);
    if (!id) return null;
    return attachments.get(id) || null;
}

export function getAttachmentBase(attachmentId) {
    return attachmentBases.get(attachmentId) || null;
}

export function getAllAttachments() {
    return Array.from(attachments.values());
}
