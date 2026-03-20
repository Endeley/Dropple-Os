export function createDefaultSlice(slice) {
    switch (slice) {
        case 'graphs':
            return {};

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
