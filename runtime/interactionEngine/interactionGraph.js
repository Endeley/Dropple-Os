export class InteractionGraph {
  constructor(nodes = []) {
    this.nodes = Array.isArray(nodes) ? [...nodes] : [];
  }

  getNodes() {
    return this.nodes;
  }

  addNode(node) {
    this.nodes.push(node);
    return this;
  }
}

export class GraphNode {
  constructor(id, evaluate) {
    this.id = id;
    this.evaluate = evaluate;
  }
}
