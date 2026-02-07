function normalizePath(value) {
  return String(value || "").replaceAll("\\", "/");
}

function isNodeLayoutMember(expr) {
  if (!expr || expr.type !== "MemberExpression") return false;
  const object = expr.object;
  const property = expr.property;
  if (!object || !property || expr.computed) return false;
  if (
    object.type === "MemberExpression" &&
    !object.computed &&
    object.object?.type === "Identifier" &&
    object.object.name === "node" &&
    object.property?.type === "Identifier" &&
    object.property.name === "layout"
  ) {
    return true;
  }
  return false;
}

function containsNodeLayoutReference(expr) {
  if (!expr) return false;
  if (isNodeLayoutMember(expr)) return true;
  if (expr.type === "MemberExpression") {
    return (
      containsNodeLayoutReference(expr.object) ||
      (expr.computed && containsNodeLayoutReference(expr.property))
    );
  }
  if (expr.type === "BinaryExpression" || expr.type === "LogicalExpression") {
    return (
      containsNodeLayoutReference(expr.left) ||
      containsNodeLayoutReference(expr.right)
    );
  }
  if (expr.type === "ConditionalExpression") {
    return (
      containsNodeLayoutReference(expr.test) ||
      containsNodeLayoutReference(expr.consequent) ||
      containsNodeLayoutReference(expr.alternate)
    );
  }
  if (expr.type === "CallExpression") {
    if (containsNodeLayoutReference(expr.callee)) return true;
    return expr.arguments.some(containsNodeLayoutReference);
  }
  return false;
}

function getTypeValue(node) {
  if (!node || node.type !== "ObjectExpression") return null;
  for (const prop of node.properties || []) {
    if (!prop || prop.type !== "Property") continue;
    const key = prop.key;
    const isTypeKey =
      (key.type === "Identifier" && key.name === "type") ||
      (key.type === "Literal" && key.value === "type");
    if (!isTypeKey) continue;
    if (prop.value?.type === "Literal") return prop.value.value;
    if (
      prop.value?.type === "MemberExpression" &&
      !prop.value.computed &&
      prop.value.object?.type === "Identifier" &&
      prop.value.object.name === "EventTypes" &&
      prop.value.property?.type === "Identifier"
    ) {
      return `EventTypes.${prop.value.property.name}`;
    }
  }
  return null;
}

const noNodeViewLayoutMath = {
  meta: {
    type: "problem",
    docs: {
      description:
        "NodeView must not perform projection or layout math; keep projection in NodeRenderer.",
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename || context.getFilename?.());
    if (!filename.endsWith("/ui/NodeView.jsx")) return {};

    function report(node, reason) {
      context.report({
        node,
        message:
          "NodeView must not perform projection or layout math. Move this logic to NodeRenderer. " +
          reason,
      });
    }

    return {
      Identifier(node) {
        if (
          node.name === "viewport" ||
          node.name === "scale" ||
          node.name === "zoom" ||
          node.name === "screenToWorld" ||
          node.name === "worldToScreen"
        ) {
          report(node, `Forbidden identifier "${node.name}" in NodeView.`);
        }
      },
      BinaryExpression(node) {
        if (
          containsNodeLayoutReference(node.left) ||
          containsNodeLayoutReference(node.right)
        ) {
          report(node, "Arithmetic on node.layout is forbidden in NodeView.");
        }
      },
    };
  },
};

const noUiTruthDispatch = {
  meta: {
    type: "problem",
    docs: {
      description:
        "UI code must emit intent only and must not dispatch authoritative domain events.",
    },
    messages: {
      noDispatcher:
        "UI layer must not access dispatcher or dispatch truth. Emit intent via canvasBus instead.",
      noNodeCreate:
        "UI may not emit NODE_CREATE truth events. Emit intent.node.create via canvasBus instead.",
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename || context.getFilename?.());
    if (!filename.includes("/ui/")) return {};

    const ALLOWLIST = [
      /\/ui\/interaction\/.*Resolver\.js$/,
      /\/ui\/interaction\/sessionBinding\.js$/,
      /\/ui\/interaction\/dispatcher\.js$/,
      /\/ui\/timeline\/.*Bridge\.js$/,
      /\/ui\/timeline\/editEventBridge\.js$/,
      /\/ui\/bridges\/.*/,
    ];
    if (ALLOWLIST.some((rx) => rx.test(filename))) return {};

    return {
      ImportDeclaration(node) {
        const source = String(node.source?.value || "");
        const sourceLower = source.toLowerCase().replaceAll("\\", "/");
        const hasDispatcherLikeSource =
          /(^|\/)dispatcher(\.[cm]?[jt]sx?)?$/.test(sourceLower) ||
          /(^|\/)dispatchercontext(\.[cm]?[jt]sx?)?$/.test(sourceLower) ||
          sourceLower.includes("usedispatcher");
        const hasDispatcherLikeSpecifier = (node.specifiers || []).some((specifier) => {
          const imported = specifier.imported?.name || "";
          const local = specifier.local?.name || "";
          return (
            imported === "dispatcher" ||
            imported === "useDispatcher" ||
            local === "dispatcher" ||
            local === "useDispatcher"
          );
        });
        if (hasDispatcherLikeSource || hasDispatcherLikeSpecifier) {
          context.report({
            node,
            messageId: "noDispatcher",
          });
        }
      },
      CallExpression(node) {
        if (node.callee?.type === "Identifier" && node.callee.name === "useDispatcher") {
          context.report({
            node,
            messageId: "noDispatcher",
          });
        }

        if (
          node.callee?.type === "MemberExpression" &&
          node.callee.property?.type === "Identifier" &&
          node.callee.property.name === "dispatch"
        ) {
          context.report({
            node,
            messageId: "noDispatcher",
          });
        }

        if (
          node.callee?.type === "Identifier" &&
          node.callee.name === "emit" &&
          node.arguments?.length > 0 &&
          node.arguments[0]?.type === "ObjectExpression"
        ) {
          const typeValue = getTypeValue(node.arguments[0]);
          if (
            typeValue === "node.create" ||
            typeValue === "node/create" ||
            typeValue === "EventTypes.NODE_CREATE"
          ) {
            context.report({
              node,
              messageId: "noNodeCreate",
            });
          }
        }
      },
    };
  },
};

const singleDispatcherOwner = {
  meta: {
    type: "problem",
    docs: {
      description:
        "DispatcherProvider may only be imported within workspace/WorkspaceRoot.",
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename || context.getFilename?.());
    const allowed = filename.includes("/workspace/WorkspaceRoot/");
    if (allowed) return {};

    return {
      ImportDeclaration(node) {
        const hasDispatcherProviderImport = (node.specifiers || []).some(
          (specifier) =>
            specifier.type === "ImportSpecifier" &&
            specifier.imported?.type === "Identifier" &&
            specifier.imported.name === "DispatcherProvider"
        );
        if (hasDispatcherProviderImport) {
          context.report({
            node,
            message:
              "DispatcherProvider ownership is exclusive to workspace/WorkspaceRoot.",
          });
        }
      },
    };
  },
};

const droppleArchitecture = {
  meta: {
    name: "dropple-architecture",
  },
  rules: {
    "no-nodeview-layout-math": noNodeViewLayoutMath,
    "no-ui-truth-dispatch": noUiTruthDispatch,
    "single-dispatcher-owner": singleDispatcherOwner,
  },
};

export default droppleArchitecture;
