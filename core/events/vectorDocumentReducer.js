import { EventTypes } from '@/core/events/eventTypes.js';

function getDocumentVectors(document) {
  return document?.vectors ?? {};
}

function sanitizeVectorPayload(node) {
  if (!node?.id) {
    return null;
  }

  return {
    id: node.id,
    type: node.type ?? 'path',
    path: node.path ?? '',
    fill: node.fill ?? 'none',
    stroke: node.stroke ?? 'none',
    strokeWidth: node.strokeWidth ?? 1,
    viewBox: node.viewBox ?? null,
    metadata: node.metadata ?? {},
  };
}

export function vectorDocumentReducer(document = {}, event) {
  const vectors = getDocumentVectors(document);

  switch (event.type) {
    case EventTypes.VECTOR_CREATE: {
      const nextVector = sanitizeVectorPayload(event.payload);
      if (!nextVector) {
        return document;
      }

      return {
        ...document,
        vectors: {
          ...vectors,
          [nextVector.id]: nextVector,
        },
      };
    }

    case EventTypes.VECTOR_UPDATE: {
      const id = event.payload?.id;
      const updates = event.payload?.updates ?? {};
      const current = vectors[id];
      if (!id || !current) {
        return document;
      }

      return {
        ...document,
        vectors: {
          ...vectors,
          [id]: {
            ...current,
            ...updates,
            id,
          },
        },
      };
    }

    case EventTypes.VECTOR_DELETE: {
      const id = event.payload?.id;
      if (!id || !vectors[id]) {
        return document;
      }

      const nextVectors = { ...vectors };
      delete nextVectors[id];

      return {
        ...document,
        vectors: nextVectors,
      };
    }

    default:
      return document;
  }
}
