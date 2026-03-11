import { selectionReducer } from '@/core/events/reducers/selectionReducers.js';
import { EventTypes } from '@/core/events/eventTypes.js';

let state = { selection: { ids: new Set(), primary: null } };

state = selectionReducer(state, {
  type: EventTypes.SELECTION_SET,
  payload: { ids: ['a'], primary: 'a' },
});

console.log('SET:', state.selection.ids.has('a'));

state = selectionReducer(state, {
  type: EventTypes.SELECTION_ADD,
  payload: { id: 'b' },
});

console.log('ADD:', state.selection.ids.has('b'));

state = selectionReducer(state, {
  type: EventTypes.SELECTION_REMOVE,
  payload: { id: 'a' },
});

console.log('REMOVE:', !state.selection.ids.has('a'));
