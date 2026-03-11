import { nanoid } from 'nanoid';

export function generateNodeId(prefix = 'node') {
    return `${prefix}-${nanoid()}`;
}
