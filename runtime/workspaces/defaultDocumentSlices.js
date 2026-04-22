export function createDefaultSlice(slice) {
    switch (slice) {
        case 'graphs':
            return {};

        case 'tokens':
            return {};

        case 'themes':
            return {
                activeThemeId: null,
                byId: {},
                order: [],
            };

        case 'tokenVersions':
            return {
                entries: {},
                order: [],
                activeVersionId: null,
            };

        case 'motion':
            return {
                clips: {},
            };

        case 'sequences':
            return {
                sequences: {},
                activeSequenceId: null,
            };

        case 'rigs':
            return {
                rigs: {},
                activeRigId: null,
            };

        case 'stateMachines':
            return {
                machines: {},
                activeMachineId: null,
            };

        default:
            return undefined;
    }
}
