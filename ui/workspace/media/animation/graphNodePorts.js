'use client';

export function getVisibleInputs(node) {
    switch (node?.type) {
        case 'add':
        case 'multiply':
        case 'mix':
            return ['a', 'b'];
        case 'curve':
        case 'ease':
        case 'spring':
        case 'ik':
        case 'clamp':
        case 'remap':
        case 'sin':
        case 'noise':
        case 'passthrough':
            return ['input'];
        default:
            return [];
    }
}
