# Non-Destructive Implementation Rule (Dropple v1)

We will NOT override, rename, or duplicate existing files or folders.
Everything new will be additive, layered, or wired in, never destructive.

This prevents the inconsistency that killed the previous project.

---

## Implementation Rules

### 1. Existing files are read-only by default
Any file that already exists (examples):
- `WorkspaceShell`
- `ui/tools/*`
- registries
- inspector components
- canvas logic

We do not rewrite them unless:
- the change is minimal
- the diff is surgical
- and you explicitly say “modify X”

Otherwise, we wrap or extend.

---

### 2. New logic goes into new, clearly named files
Instead of touching existing code, we introduce thin coordination layers.

Examples (illustrative):
```
ui/
├─ capabilities/
│  ├─ capabilityMap.ts
│  ├─ workspaceCaps.ts
│  └─ modeLocks.ts
│
├─ availability/
│  └─ useToolAvailability.ts
│
├─ layering/
│  └─ uiLayers.ts
```

No collisions. No doubles. No guessing.

---

### 3. Existing tools are NOT duplicated
You already have:
- `ui/tools/*`

We do not create:
- `ui/tools-v2`
- `ui/newTools`
- `ui/uiuxTools`

Tools stay where they are. We annotate or register them externally.

Example (non-invasive):
```
export const toolCapabilities = {
  'frame-tool': ['node.create'],
  'select-tool': ['node.select'],
};
```

---

### 4. Workspace behavior is decided outside tools
Tools do not ask “Am I allowed here?” They just exist.

Workspace + mode decide:
- ACTIVE
- READ-ONLY
- HIDDEN

This logic lives in one place only (a new file). No scattered conditionals like:
```
if (workspace === 'uiux') { ... }
```

---

### 5. UI layout stays exactly as-is
You are keeping:
- Left sidebar
- Right inspector
- Infinite canvas

Floating tools are additive later. We are organizing, not redesigning.

---

## Practical Enforcement
When we implement:
- We reference existing folders
- We import, not copy
- We gate visibility, not move components
- We add glue files, not rewrite foundations

If something would require:
- deleting a file
- renaming a folder
- duplicating logic

We pause and re-evaluate, not push through.
