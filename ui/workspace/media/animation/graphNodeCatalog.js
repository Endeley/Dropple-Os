const GRAPH_NODE_LIBRARY = Object.freeze([
    {
        type: 'value',
        label: 'Value',
        summary: 'Emit a fixed channel value.',
        template: {
            controllerId: '',
            channel: 'rotation',
            value: 0,
        },
        fields: ['controllerId', 'channel', 'value'],
    },
    {
        type: 'parameter',
        label: 'Parameter',
        summary: 'Bind a graph parameter to a channel.',
        template: {
            controllerId: '',
            channel: 'rotation',
            name: 'speed',
            default: 0,
        },
        fields: ['controllerId', 'channel', 'name', 'default'],
    },
    {
        type: 'add',
        label: 'Add',
        summary: 'Sum two input layers.',
        template: {},
        fields: [],
    },
    {
        type: 'multiply',
        label: 'Multiply',
        summary: 'Multiply two input layers.',
        template: {},
        fields: [],
    },
    {
        type: 'mix',
        label: 'Mix',
        summary: 'Blend inputs by weight.',
        template: {
            weight: 0.5,
        },
        fields: ['weight'],
    },
    {
        type: 'clamp',
        label: 'Clamp',
        summary: 'Clamp incoming values.',
        template: {
            min: 0,
            max: 1,
        },
        fields: ['min', 'max'],
    },
    {
        type: 'remap',
        label: 'Remap',
        summary: 'Map a value range to another range.',
        template: {
            inMin: 0,
            inMax: 1,
            outMin: 0,
            outMax: 1,
        },
        fields: ['inMin', 'inMax', 'outMin', 'outMax'],
    },
    {
        type: 'time',
        label: 'Time',
        summary: 'Emit the current frame to a channel.',
        template: {
            controllerId: '',
            channel: 'rotation',
        },
        fields: ['controllerId', 'channel'],
    },
    {
        type: 'sin',
        label: 'Sin',
        summary: 'Drive a channel with a sine wave.',
        template: {
            controllerId: '',
            channel: 'rotation',
            amplitude: 1,
            frequency: 1,
            phase: 0,
        },
        fields: ['controllerId', 'channel', 'amplitude', 'frequency', 'phase'],
    },
    {
        type: 'noise',
        label: 'Noise',
        summary: 'Drive a channel with deterministic noise.',
        template: {
            controllerId: '',
            channel: 'rotation',
            amplitude: 1,
            frequency: 1,
            seed: 0,
        },
        fields: ['controllerId', 'channel', 'amplitude', 'frequency', 'seed'],
    },
    {
        type: 'curve',
        label: 'Curve',
        summary: 'Shape input through keyed values.',
        template: {
            controllerId: '',
            channel: 'rotation',
            keys: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
        },
        fields: ['controllerId', 'channel'],
    },
    {
        type: 'ease',
        label: 'Ease',
        summary: 'Apply easing to an input curve.',
        template: {
            controllerId: '',
            channel: 'rotation',
            mode: 'linear',
        },
        fields: ['controllerId', 'channel', 'mode'],
    },
    {
        type: 'spring',
        label: 'Spring',
        summary: 'Apply analytic spring response.',
        template: {
            controllerId: '',
            channel: 'rotation',
            stiffness: 10,
            damping: 5,
        },
        fields: ['controllerId', 'channel', 'stiffness', 'damping'],
    },
    {
        type: 'ik',
        label: 'IK',
        summary: 'Solve a two-bone chain analytically.',
        template: {
            chain: ['root', 'joint', 'end'],
        },
        fields: ['chain'],
    },
]);

const GRAPH_NODE_LIBRARY_MAP = Object.freeze(
    Object.fromEntries(GRAPH_NODE_LIBRARY.map((entry) => [entry.type, entry])),
);

export { GRAPH_NODE_LIBRARY };

export function getGraphNodeDefinition(type) {
    return GRAPH_NODE_LIBRARY_MAP[type] ?? null;
}

export function getGraphNodeTemplate(type, { id, position } = {}) {
    const definition = getGraphNodeDefinition(type);
    if (!definition) return null;

    return {
        id,
        type,
        position: position ?? { x: 0, y: 0 },
        ...definition.template,
    };
}

export function getInspectableGraphFields(node) {
    const definition = getGraphNodeDefinition(node?.type);
    return definition?.fields ?? [];
}
