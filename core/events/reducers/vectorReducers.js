import { vectorDocumentReducer } from '@/core/events/vectorDocumentReducer.js';

function applyDocumentVectors(state, nextDocument) {
  return {
    ...state,
    document: nextDocument,
    vectors: nextDocument?.vectors ?? {},
  };
}

export function vectorReducers(state, event) {
  const currentDocument = state?.document ?? {};
  const nextDocument = vectorDocumentReducer(currentDocument, event);

  if (nextDocument === currentDocument) {
    return state;
  }

  return applyDocumentVectors(state, nextDocument);
}
