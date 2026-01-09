import { createDesignState } from '../state/createDesignState.js';
import { nodeLifecycleReducer } from './nodeLifecycleReducer.js';
import { nodeStructureReducer } from './nodeStructureReducer.js';
import { nodeLayoutReducer } from './nodeLayoutReducer.js';
import { nodeStyleReducer } from './nodeStyleReducer.js';
import { nodeContentReducer } from './nodeContentReducer.js';

export function designReducer(state = createDesignState(), event) {
  switch (event.type) {
    case 'node.create':
    case 'node.delete':
    case 'node.children.reorder':
      return nodeLifecycleReducer(state, event);

    case 'node.reparent':
    case 'node.reorder':
      return nodeStructureReducer(state, event);

    case 'node.layout.update':
    case 'node.layout.move':
    case 'node.layout.resize':
    case 'node.layout.setConstraint':
    case 'node.layout.clearConstraint':
    case 'node.layout.setAutoLayout':
    case 'node.layout.clearAutoLayout':
      return nodeLayoutReducer(state, event);

    case 'node.style.update':
      return nodeStyleReducer(state, event);

    case 'text.content.update':
    case 'image.source.update':
      return nodeContentReducer(state, event);

    default:
      return state;
  }
}
