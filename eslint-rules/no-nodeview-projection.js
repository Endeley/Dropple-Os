const noNodeviewProjection = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow projection logic in NodeView",
    },
    messages: {
      noViewport: "NodeView must not reference viewport or scale.",
      noLayoutMath: "NodeView must not perform arithmetic on node.layout.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    if (!filename.endsWith("NodeView.jsx")) return {};

    return {
      Identifier(node) {
        if (["viewport", "scale", "worldOffset"].includes(node.name)) {
          context.report({ node, messageId: "noViewport" });
        }
      },

      BinaryExpression(node) {
        const source = context.getSourceCode().getText(node);
        if (source.includes("node.layout")) {
          context.report({ node, messageId: "noLayoutMath" });
        }
      },
    };
  },
};

export default noNodeviewProjection;
