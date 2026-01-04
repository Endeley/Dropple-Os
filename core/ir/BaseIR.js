/**
 * Base contract for all Dropple IR nodes.
 * This file defines SHAPE ONLY.
 * No logic, no validation, no runtime usage.
 */
export const BaseIR = {
    id: '', // stable identifier
    kind: '', // component | container | text | media | timeline | state
    meta: {
        name: '',
        description: '',
        tags: [],
    },
};
