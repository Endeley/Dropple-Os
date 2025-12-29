export function createLockManager() {
    const locks = new Map(); // nodeId → userId

    function lock(nodeId, userId) {
        if (locks.has(nodeId)) return false;
        locks.set(nodeId, userId);
        return true;
    }

    function unlock(nodeId, userId) {
        if (locks.get(nodeId) !== userId) return false;
        locks.delete(nodeId);
        return true;
    }

    function isLocked(nodeId, userId) {
        const owner = locks.get(nodeId);
        return owner && owner !== userId;
    }

    return { lock, unlock, isLocked };
}
