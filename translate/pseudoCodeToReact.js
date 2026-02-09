/**
 * E4a — Pseudo-Code → React
 *
 * Input: E3 pseudo-code (string)
 * Output: React component source (string)
 *
 * Constraints:
 * - Structural only
 * - No styling
 * - No hooks
 * - No state
 * - No events
 * - No inference beyond explicit RELATION parent
 */

export function pseudoCodeToReact(pseudoCode) {
  const lines = pseudoCode.split("\n");

  const nodes = {};
  const childrenMap = {};
  let currentNode = null;

  // ---------- parse ----------
  for (const line of lines) {
    if (line.startsWith("NODE ")) {
      const { type, id } = parseNode(line);
      nodes[id] = { type, id, props: {}, children: [] };
      currentNode = id;
    }

    if (line.startsWith("  content:") && currentNode) {
      nodes[currentNode].props.content =
        stripQuotes(line.replace("  content:", "").trim());
    }

    if (line.startsWith("RELATION parent")) {
      const { from, to } = parseRelation(line);
      childrenMap[from] ??= [];
      childrenMap[from].push(to);
    }
  }

  // ---------- build hierarchy ----------
  for (const [parent, children] of Object.entries(childrenMap)) {
    for (const child of children) {
      nodes[parent].children.push(nodes[child]);
    }
  }

  const rootNodes = Object.values(nodes).filter(
    n => !Object.values(childrenMap).some(children => children.includes(n.id))
  );

  // ---------- render ----------
  const jsx = rootNodes.map(renderNode).join("\n");

  return `
function App() {
  return (
${indent(jsx, 4)}
  );
}

export default App;
`.trim();
}

// ---------------- helpers ----------------

function parseNode(line) {
  // NODE Frame(id=frame-1)
  const match = line.match(/^NODE\s+(\w+)\(id=([^)]+)\)/);
  return { type: match[1], id: match[2] };
}

function parseRelation(line) {
  // RELATION parent(a -> b)
  const match = line.match(/\(([^ ]+)\s*->\s*([^)]+)\)/);
  return { from: match[1], to: match[2] };
}

function renderNode(node) {
  const Component = node.type;
  const children = node.children.map(renderNode).join("\n");

  if (node.props.content !== undefined) {
    return `<${Component}>${node.props.content}</${Component}>`;
  }

  if (children) {
    return `<${Component}>
${indent(children, 2)}
</${Component}>`;
  }

  return `<${Component} />`;
}

function indent(str, spaces) {
  const pad = " ".repeat(spaces);
  return str
    .split("\n")
    .map(line => pad + line)
    .join("\n");
}

function stripQuotes(str) {
  return str.replace(/^"|"$/g, "");
}
