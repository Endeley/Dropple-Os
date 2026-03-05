import {
  SELECTION_SET,
  SELECTION_ADD,
  SELECTION_REMOVE,
  SELECTION_CLEAR,
} from '../selectionEvents.js';

export function selectionReducer(state, event) {
  const selection = state.selection || { ids: [] };

  switch (event.type) {
    case SELECTION_SET:
      return {
        ...state,
        selection: {
          ids: [...event.payload.ids],
        },
      };

    case SELECTION_ADD: {
      const set = new Set(selection.ids);
      set.add(event.payload.id);

      return {
        ...state,
        selection: {
          ids: Array.from(set),
        },
      };
    }

    case SELECTION_REMOVE: {
      const next = selection.ids.filter((id) => id !== event.payload.id);

      return {
        ...state,
        selection: {
          ids: next,
        },
      };
    }

    case SELECTION_CLEAR:
      return {
        ...state,
        selection: {
          ids: [],
        },
      };

    default:
      return state;
  }
}
