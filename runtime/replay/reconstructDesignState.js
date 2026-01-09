import { createDesignState } from '../../design/state/createDesignState.js';
import { designReducer } from '../../design/reducer/designReducer.js';
import { getEventsUpToCursor } from '../events/getEventsUpToCursor.js';
import { educationReducer } from '../../education/educationReducer.js';

export function reconstructDesignState({
  events,
  cursor,
}) {
  const relevantEvents = getEventsUpToCursor(events, cursor);

  let state = createDesignState();

  for (const event of relevantEvents) {
    state = designReducer(state, event);
    state = educationReducer(state, event);
  }

  return state;
}
