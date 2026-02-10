# Dropple UI Layer Architecture (v1 Law)

You will have exactly three UI layers in the editor.

No fourth layer. No exceptions.

```
┌──────────────────────────────────────────────┐
│ 1. STRUCTURAL UI (anchored, persistent)      │
├──────────────────────────────────────────────┤
│ 2. CONTEXTUAL UI (canvas-attached)           │
├──────────────────────────────────────────────┤
│ 3. EPHEMERAL UI (floating, quick actions)    │
└──────────────────────────────────────────────┘
```

Each layer has:
- a job
- strict allowed responsibilities
- strict forbidden responsibilities

This prevents inconsistency.

---

## 1. STRUCTURAL UI LAYER
**“Where am I, and what mode am I in?”**

**Characteristics**
- Anchored (never floats)
- Always visible (unless explicitly hidden by workspace)
- Defines intent, not detail

**Components in this layer**
- `WorkspaceShell`
- LeftSidebar (Tool Rail)
- TopBar (Mode / View / Project)
- RightSidebar (Inspector)

**Allowed**
- Workspace switching
- Tool selection (select / frame / text / etc.)
- Deep property editing
- Persistent navigation (pages, layers)

**Forbidden**
- Context-sensitive one-off actions
- Selection-only controls
- “Quick” buttons
- Anything that appears/disappears based on hover

### Left Sidebar (Intent Tools)
**Rule**
If a tool changes what clicking on the canvas does → it lives here.

**Examples**
- Select
- Frame
- Text
- Shape
- Layout
- Prototype (later)
- Motion (later)

**Code contract**
```
Tool.uiLayer = 'structural'
Tool.role = 'intent'
```

### Right Sidebar (Inspector)
**Rule**
If a tool edits the state of an existing node → it lives here.

**Examples**
- Position & Size
- Fill & Stroke
- Constraints
- Background
- Box Model

Inspector sections are tools, not magic panels.

**Code contract**
```
InspectorSection.uiLayer = 'structural'
InspectorSection.role = 'state'
```

---

## 2. CONTEXTUAL UI LAYER
**“I selected something — what can I do to this?”**

This layer is attached to canvas objects.

**Characteristics**
- Appears only when relevant
- Anchored to selection (not screen)
- Never scrollable panels
- Never deep configuration

**Components in this layer**
- Canvas
  - SelectionOutline
  - ResizeHandles
  - RotationHandle
  - ConstraintIndicators
  - InlineControls (when applicable)

**Allowed**
- Resize / rotate
- Inline text edit
- Constraint hints
- Component badges
- Visual affordances

**Forbidden**
- Multi-step actions
- Forms
- Inspector-level editing
- Persistent UI

**Example: Resize Handles**
```
ResizeHandle = {
  uiLayer: 'contextual',
  requiresSelection: true,
  capabilities: ['layout.write']
}
```

If capability is missing → handle does not render. No disabled junk.

---

## 3. EPHEMERAL UI LAYER
**“Do this faster.”**

This layer is optional, never required.

**Characteristics**
- Floating
- Temporary
- Low cognitive load
- Shortcut-friendly

**Components in this layer**
- FloatingUIRoot
  - QuickActionsPalette
  - ContextMenu
  - InlinePickers (color, align, etc.)

**Allowed**
- One-click actions
- Shortcuts
- Power-user accelerators

**Forbidden**
- Full editors
- Inspector replacements
- Required workflows
- Anything stateful

### The One Floating System You Should Have
**Quick Actions Palette**

Triggered by:
- keyboard shortcut
- selection hover
- long-press (later)

Example actions:
- Duplicate
- Align center
- Add auto layout
- Wrap in frame

**Code contract**
```
QuickAction = {
  uiLayer: 'ephemeral',
  maxSteps: 1,
  capabilities: ['layout.write']
}
```

If it needs more than one step → it doesn’t belong here.

---

## How All Tools Fit Cleanly
Every tool must declare three things:

```
Tool {
  uiLayer: 'structural' | 'contextual' | 'ephemeral'
  role: 'intent' | 'state' | 'action'
  capabilities: string[]
}
```

Visibility is then computed:

```
workspace allows capability?
  ├─ no → HIDDEN
  ├─ yes + locked by mode → READ-ONLY
  └─ yes → ACTIVE
```

No tool decides this itself.

---

## Why This Solves Inconsistency
Before:
- UI implied power that didn’t exist
- Tools lived wherever they “felt right”
- Workspaces duplicated logic

Now:
- One tool definition
- One visibility rule
- One layout truth

You can:
- reuse tools across workspaces
- promote tools from read-only → active in v2
- add floating tools without breaking structure

---

## Next Step (Concrete)
Now that the layers are locked, the next correct step is:

**Step 2: Classify every existing tool**
- assign `uiLayer`
- assign `role`
- assign `capabilities`

Nothing else.
