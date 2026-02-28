import { WorldStore } from '../../persistence/worldStore.js';

export const worldPersistenceAdapter = {
    load(workspaceId) {
        return WorldStore.load(workspaceId);
    },
    save(workspaceId, payload) {
        WorldStore.save(workspaceId, payload);
    },
};
