export function educationReducer(state, event) {
  if (!state.education) {
    state.education = {
      annotations: [],
      explanations: [],
    };
  }

  switch (event.type) {
    case 'education.annotation.add': {
      state.education.annotations.push(event.payload);
      return state;
    }

    case 'education.explanation.add': {
      state.education.explanations.push(event.payload);
      return state;
    }

    case 'education.annotation.remove': {
      state.education.annotations = state.education.annotations.filter(
        (a) => a.id !== event.payload.id
      );
      return state;
    }

    case 'education.explanation.remove': {
      state.education.explanations = state.education.explanations.filter(
        (e) => e.id !== event.payload.id
      );
      return state;
    }

    default:
      return state;
  }
}
