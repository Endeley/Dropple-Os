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
import { assetReducers } from "./assetReducers.js";
import { exportReducers } from "./exportReducers.js";
import { sceneShotReducers } from "./sceneShotReducers.js";
import { behaviorReducers } from "./behaviorReducers.js";
import { stateMachineReducers } from "./stateMachineReducers.js";
import { tokenReducers } from './tokenReducers.js';
import { themeReducers } from './themeReducers.js';
import { tokenReviewReducers } from './tokenReviewReducers.js';
import { tokenVersionReducers } from './tokenVersionReducers.js';
import { navigationReducers } from "./navigationReducers.js";
import { collaborationReducers } from "./collaborationReducers.js";
import { vectorReducers } from "./vectorReducers.js";
import { aiReducers } from "./aiReducers.js";
import { federationAuditReducers } from './federationAuditReducers.js';
import { projectBootstrapReducers } from './projectBootstrapReducers.js';
import { selectionReducer } from "./selectionReducers.js";
import { viewportReducer } from "./viewportReducer.js";
import { graphInteractionReducer } from './graphInteractionReducer.js';
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
    allowedDocumentSlices: ['sceneGraph'],
    allowedRuntimeSlices: ['behaviors', 'behaviorRuntime'],
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
  next = applyOwnedReducer(next, event, graphInteractionReducer, 'graphInteractionReducer', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['graph'],
  });
  next = applyOwnedReducer(next, event, sequenceReducers, 'sequenceReducers', {
    allowedDocumentSlices: ['sequences'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, assetReducers, 'assetReducers', {
    allowedDocumentSlices: ['assets'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, exportReducers, 'exportReducers', {
    allowedDocumentSlices: ['exports'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, sceneShotReducers, 'sceneShotReducers', {
    allowedDocumentSlices: ['sceneGraph'],
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
  next = applyOwnedReducer(next, event, federationAuditReducers, 'federationAuditReducers', {
    allowedDocumentSlices: [],
    allowedRuntimeSlices: ['federationAudit'],
  });
  next = applyOwnedReducer(next, event, projectBootstrapReducers, 'projectBootstrapReducers', {
    allowedDocumentSlices: ['meta'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, vectorReducers, 'vectorReducers', {
    allowedDocumentSlices: ['vectors'],
    allowedRuntimeSlices: ['vectors'],
  });
  next = applyOwnedReducer(next, event, tokenReducers, 'tokenReducers', {
    allowedDocumentSlices: ['tokens', 'themes'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, themeReducers, 'themeReducers', {
    allowedDocumentSlices: ['themes'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, tokenReviewReducers, 'tokenReviewReducers', {
    allowedDocumentSlices: ['tokenReviews'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, tokenVersionReducers, 'tokenVersionReducers', {
    allowedDocumentSlices: ['tokenVersions'],
    allowedRuntimeSlices: [],
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
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, nodeStructureReducers, 'nodeStructureReducers', {
    allowedDocumentSlices: ['sceneGraph', 'layout'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, layoutReducers, 'layoutReducers', {
    allowedDocumentSlices: ['layout'],
    allowedRuntimeSlices: [],
  });
  next = applyOwnedReducer(next, event, styleReducers, 'styleReducers', {
    allowedDocumentSlices: ['sceneGraph'],
    allowedRuntimeSlices: [],
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
