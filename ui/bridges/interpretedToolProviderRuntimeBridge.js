import { createInterpretedToolProviderController } from '@/runtime/tools/createInterpretedToolProviderController.js';

export function createInterpretedToolProviderRuntimeBridge({ emit } = {}) {
    return createInterpretedToolProviderController({ emit });
}
