import {
  TemplateArtifactV1,
  StructureNode,
} from "../types";
import {
  TEMPLATE_V1_KEYS,
  REQUIRED_METADATA_FIELDS,
  ALLOWED_VIEWPORTS,
  ALLOWED_MOTION_PROPERTIES,
  ALLOWED_PARAM_TYPES,
} from "../schema/template.v1";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function detectCycleInTree(
  tree: Record<string, string[]>,
  root: string
): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) {
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    stack.add(node);

    const children = tree[node] || [];
    for (const child of children) {
      if (dfs(child)) {
        return true;
      }
    }

    stack.delete(node);
    return false;
  }

  return dfs(root);
}

export function validateTemplateArtifact(
  artifact: unknown
): { ok: true } {
  // STEP 0 — Input sanity
  if (!isPlainObject(artifact)) {
    throw new ValidationError("Artifact must be a plain object");
  }

  // STEP 1 — Top-level keys
  const keys = Object.keys(artifact);

  if (keys.length !== TEMPLATE_V1_KEYS.length) {
    throw new ValidationError("Invalid number of top-level keys");
  }

  for (const key of TEMPLATE_V1_KEYS) {
    if (!(key in artifact)) {
      throw new ValidationError(`Missing top-level key: ${key}`);
    }
  }

  for (const key of keys) {
    if (!TEMPLATE_V1_KEYS.includes(key as any)) {
      throw new ValidationError(`Unknown top-level key: ${key}`);
    }
  }

  const typed = artifact as TemplateArtifactV1;

  // STEP 2 — Metadata
  if (!isPlainObject(typed.metadata)) {
    throw new ValidationError("metadata must be an object");
  }

  for (const field of REQUIRED_METADATA_FIELDS) {
    const value = (typed.metadata as any)[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`Invalid metadata field: ${field}`);
    }
  }

  // STEP 3 — Structure
  const { structure } = typed;

  if (!Array.isArray(structure.nodes) || structure.nodes.length === 0) {
    throw new ValidationError("structure.nodes must be non-empty");
  }

  const nodeIds = new Set<string>();

  for (const node of structure.nodes as StructureNode[]) {
    if (typeof node.id !== "string") {
      throw new ValidationError("Each node must have an id");
    }
    if (typeof node.type !== "string") {
      throw new ValidationError("Each node must have a type");
    }
    if (nodeIds.has(node.id)) {
      throw new ValidationError(`Duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  if (!nodeIds.has(structure.root)) {
    throw new ValidationError("structure.root must reference a valid node");
  }

  // Tree validation
  if (!isPlainObject(structure.tree)) {
    throw new ValidationError("structure.tree must be an object");
  }

  for (const parentId in structure.tree) {
    if (!nodeIds.has(parentId)) {
      throw new ValidationError(`Unknown tree parent: ${parentId}`);
    }

    const children = structure.tree[parentId];
    if (!Array.isArray(children)) {
      throw new ValidationError("Tree children must be arrays");
    }

    for (const childId of children) {
      if (!nodeIds.has(childId)) {
        throw new ValidationError(`Unknown tree child: ${childId}`);
      }
    }
  }

  // Cycle detection (hardening)
  if (detectCycleInTree(structure.tree, structure.root)) {
    throw new ValidationError(
      "structure.tree contains a cycle (cycles are not allowed)"
    );
  }

  // STEP 4 — Motion
  const { motion } = typed;

  if (!isPlainObject(motion.timelines)) {
    throw new ValidationError("motion.timelines must be an object");
  }

  for (const name in motion.timelines) {
    const timeline = motion.timelines[name];

    if (typeof timeline.duration !== "number" || timeline.duration <= 0) {
      throw new ValidationError(`Invalid duration for timeline: ${name}`);
    }

    if (!Array.isArray(timeline.tracks)) {
      throw new ValidationError(`Timeline ${name} must have tracks`);
    }

    for (const track of timeline.tracks) {
      if (!nodeIds.has(track.target)) {
        throw new ValidationError(
          `Motion track targets unknown node: ${track.target}`
        );
      }

      if (!ALLOWED_MOTION_PROPERTIES.includes(track.property as any)) {
        throw new ValidationError(`Invalid motion property: ${track.property}`);
      }

      if (!Array.isArray(track.keyframes) || track.keyframes.length === 0) {
        throw new ValidationError("Motion track must have keyframes");
      }

      let lastTime = -Infinity;
      for (const kf of track.keyframes) {
        if (typeof kf.t !== "number") {
          throw new ValidationError("Keyframe.t must be a number");
        }
        if (kf.t <= lastTime) {
          throw new ValidationError("Keyframes must be time-ordered");
        }
        lastTime = kf.t;
      }
    }
  }

  // STEP 5 — Params (surface only)
  if (!isPlainObject(typed.params)) {
    throw new ValidationError("params must be an object");
  }

  for (const group of ["content", "style", "motion"] as const) {
    const block = (typed.params as any)[group];
    if (block !== undefined && !isPlainObject(block)) {
      throw new ValidationError(`params.${group} must be an object`);
    }

    if (block) {
      for (const [paramKey, paramValue] of Object.entries(block)) {
        if (!isPlainObject(paramValue)) {
          throw new ValidationError(`params.${group}.${paramKey} must be an object`);
        }
        const paramType = (paramValue as any).type;
        if (!ALLOWED_PARAM_TYPES.includes(paramType)) {
          throw new ValidationError(`Invalid param type: ${paramType}`);
        }
      }
    }
  }

  // STEP 6 — Runtime
  const { runtime } = typed;

  if (!isPlainObject(runtime)) {
    throw new ValidationError("runtime must be an object");
  }

  if (Array.isArray(runtime.viewport)) {
    for (const v of runtime.viewport) {
      if (!ALLOWED_VIEWPORTS.includes(v)) {
        throw new ValidationError(`Invalid viewport: ${v}`);
      }
    }
  }

  if (runtime.export) {
    if (typeof runtime.export.motionVideo !== "boolean") {
      throw new ValidationError("export.motionVideo must be boolean");
    }
    if (typeof runtime.export.code !== "boolean") {
      throw new ValidationError("export.code must be boolean");
    }
  }

  return { ok: true };
}
