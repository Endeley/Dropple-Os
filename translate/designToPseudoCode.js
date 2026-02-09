/**
 * E3 — Design → Pseudo-Code
 *
 * Input: DroppleSpec v2
 * Output: string (plain text pseudo-code)
 *
 * Contract: E3.1 (LOCKED)
 * - Deterministic
 * - Read-only
 * - No inference
 * - No runtime data
 */
export function designToPseudoCode(droppleSpec) {
  const lines = [];

  // 1. WORKSPACE header
  lines.push(`WORKSPACE ${droppleSpec.version}`);
  lines.push("");

  // 2. NODE blocks (deterministic order)
  const nodes = [...(droppleSpec.nodes ?? [])].sort(sortById);

  for (const node of nodes) {
    lines.push(`NODE ${node.type}(id=${node.id})`);

    // Allowed semantic attributes only
    if (node.transform?.position) {
      const { x, y } = node.transform.position;
      lines.push(`  position: (${x}, ${y})`);
    }

    if (node.props?.content !== undefined) {
      lines.push(`  content: ${stringify(node.props.content)}`);
    }

    // Other props (opaque, stringified)
    if (node.props) {
      for (const [key, value] of Object.entries(node.props)) {
        if (key === "content") continue;
        lines.push(`  ${key}: ${stringify(value)}`);
      }
    }

    lines.push(""); // blank line between NODE blocks
  }

  // Remove trailing blank line if nodes existed
  if (nodes.length > 0) {
    lines.pop();
  }

  lines.push("");

  // 3. RELATION lines (deterministic order)
  const edges = [...(droppleSpec.edges ?? [])].sort(sortEdges);

  for (const edge of edges) {
    lines.push(`RELATION ${edge.type}(${edge.from} -> ${edge.to})`);
  }

  return lines.join("\n");
}

// ----------------- helpers -----------------

function sortById(a, b) {
  return a.id.localeCompare(b.id);
}

function sortEdges(a, b) {
  if (a.type !== b.type) return a.type.localeCompare(b.type);
  if (a.from !== b.from) return a.from.localeCompare(b.from);
  return a.to.localeCompare(b.to);
}

function stringify(value) {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "[complex]";
}
