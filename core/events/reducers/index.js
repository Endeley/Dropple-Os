// core/events/reducers/index.js

import { nodeReducers } from "./nodeReducers.js";
import { nodeStructureReducers } from "./nodeStructureReducers.js";
import { layoutReducers } from "./layoutReducers.js";
import { styleReducers } from "./styleReducers.js";
import { timelineReducers } from "./timelineReducers.js";
import { transitionReducers } from "./transitionReducers.js";
import { stateReducers } from "./stateReducers.js";
import { componentStateReducers } from "./componentStateReducers.js";
import { interactionReducers } from "./interactionReducers.js";
import { motionReducers } from "./motionReducers.js";
import { rigReducers } from "./rigReducers.js";
import { graphReducers } from "./graphReducers.js";
import { sequenceReducers } from "./sequenceReducers.js";
import { behaviorReducers } from "./behaviorReducers.js";
import { stateMachineReducers } from "./stateMachineReducers.js";
import { navigationReducers } from "./navigationReducers.js";
import { collaborationReducers } from "./collaborationReducers.js";
import { vectorReducers } from "./vectorReducers.js";
import { aiReducers } from "./aiReducers.js";
import { selectionReducer } from "./selectionReducers.js";
import { viewportReducer } from "./viewportReducer.js";
import { assertReducerOwnership } from '@/core/events/reducerOwnership.js';

function applyOwnedReducer(state, event, reducer, reducerName, ownership) {
  const next = reducer(state, event);
  return assertReducerOwnership(reducerName, state, next, ownership);
}

export function rootReducer(state, event) {
  let next = state;
  next = applyOwnedReducer(next, event, stateReducers, 'stateReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['activeStateId'],
  });
  next = applyOwnedReducer(next, event, componentStateReducers, 'componentStateReducers', {
    allowedDocumentSlices: ['components'],
    allowedRuntimeSlices: ['activeComponentId'],
  });
  next = applyOwnedReducer(next, event, interactionReducers, 'interactionReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['interactions'],
  });
  next = applyOwnedReducer(next, event, behaviorReducers, 'behaviorReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['behaviors', 'behaviorRuntime', 'nodes'],
  });
  next = applyOwnedReducer(next, event, motionReducers, 'motionReducers', {
    allowedDocumentSlices: ['motion'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, rigReducers, 'rigReducers', {
    allowedDocumentSlices: ['rigs'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, graphReducers, 'graphReducers', {
    allowedDocumentSlices: ['graphs'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, sequenceReducers, 'sequenceReducers', {
    allowedDocumentSlices: ['sequences'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, stateMachineReducers, 'stateMachineReducers', {
    allowedDocumentSlices: ['stateMachines'],
    allowedRuntimeSlices: ['stateMachines'],
  });
  next = applyOwnedReducer(next, event, navigationReducers, 'navigationReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['navigation'],
  });
  next = applyOwnedReducer(next, event, collaborationReducers, 'collaborationReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['collaboration'],
  });
  next = applyOwnedReducer(next, event, aiReducers, 'aiReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['ai'],
  });
  next = applyOwnedReducer(next, event, vectorReducers, 'vectorReducers', {
    allowedDocumentSlices: ['vectors'],
    allowedRuntimeSlices: ['vectors'],
  });
  next = applyOwnedReducer(next, event, selectionReducer, 'selectionReducer', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['selection'],
  });
  next = applyOwnedReducer(next, event, viewportReducer, 'viewportReducer', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['workspace'],
  });
  next = applyOwnedReducer(next, event, nodeReducers, 'nodeReducers', {
    allowedDocumentSlices: ['sceneGraph', 'layout'],
    allowedRuntimeSlices: ['nodes', 'rootIds'],
  });
  next = applyOwnedReducer(next, event, nodeStructureReducers, 'nodeStructureReducers', {
    allowedDocumentSlices: ['sceneGraph', 'layout'],
    allowedRuntimeSlices: ['nodes', 'rootIds'],
  });
  next = applyOwnedReducer(next, event, layoutReducers, 'layoutReducers', {
    allowedDocumentSlices: ['layout'],
    allowedRuntimeSlices: ['nodes'],
  });
  next = applyOwnedReducer(next, event, styleReducers, 'styleReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['nodes'],
  });
  next = applyOwnedReducer(next, event, timelineReducers, 'timelineReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['timeline'],
  });
  next = applyOwnedReducer(next, event, transitionReducers, 'transitionReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: [],
  });
  return next;
}
