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
import { behaviorReducers } from "./behaviorReducers.js";
import { selectionReducer } from "./selectionReducers.js";
import { viewportReducer } from "./viewportReducer.js";

export function rootReducer(state, event) {
  let next = state;
  next = stateReducers(next, event);
  next = componentStateReducers(next, event);
  next = interactionReducers(next, event);
  next = motionReducers(next, event);
  next = behaviorReducers(next, event);
  next = selectionReducer(next, event);
  next = viewportReducer(next, event);
  next = nodeReducers(next, event);
  next = nodeStructureReducers(next, event);
  next = layoutReducers(next, event);
  next = styleReducers(next, event);
  next = timelineReducers(next, event);
  next = transitionReducers(next, event);
  return next;
}
