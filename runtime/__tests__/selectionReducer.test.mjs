import { selectionReducer } from '@/core/events/reducers/selectionReducers.js';

let state = { selection: { ids: [] } };

state = selectionReducer(state, {
  type: 'selection/set',
  payload: { ids: ['a'] },
});

console.log('SET:', state.selection.ids.includes('a'));

state = selectionReducer(state, {
  type: 'selection/add',
  payload: { id: 'b' },
});

console.log('ADD:', state.selection.ids.includes('b'));

state = selectionReducer(state, {
  type: 'selection/remove',
  payload: { id: 'a' },
});

console.log('REMOVE:', !state.selection.ids.includes('a'));
