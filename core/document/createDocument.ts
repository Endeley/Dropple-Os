import type { DroppleDocument } from './documentSchema';
import { createCanonicalDocumentEnvelope } from '@/core/persistence/documentEnvelope.js';

export function createEmptyDocument(): DroppleDocument {
    return createCanonicalDocumentEnvelope();
}
