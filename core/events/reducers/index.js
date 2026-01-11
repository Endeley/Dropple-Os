// core/events/reducers/index.js

import { nodeReducers } from "./nodeReducers.js";
import { treeReducers } from "./treeReducers.js";
import { layoutReducers } from "./layoutReducers.js";
import { styleReducers } from "./styleReducers.js";
import { timelineReducers } from "./timelineReducers.js";
import { transitionReducers } from "./transitionReducers.js";

export function rootReducer(state, event) {
  let next = state;
  next = nodeReducers(next, event);
  next = treeReducers(next, event);
  next = layoutReducers(next, event);
  next = styleReducers(next, event);
  next = timelineReducers(next, event);
  next = transitionReducers(next, event);
  return next;
}
