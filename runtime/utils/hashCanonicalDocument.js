import { hashRuntimeState } from './hashRuntimeState.js';

export function hashCanonicalDocument(document) {
    return hashRuntimeState(document ?? {});
}
