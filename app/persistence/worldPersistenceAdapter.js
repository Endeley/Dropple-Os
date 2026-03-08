import { WorldStore } from '../../runtime/persistence/worldStore.js';

export const worldPersistenceAdapter = {
    load(workspaceId) {
        return WorldStore.load(workspaceId);
    },
    save(workspaceId, payload) {
        WorldStore.save(workspaceId, payload);
    },
};
