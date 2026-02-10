# Dropple — Developer Guide (v1)

## What Dropple Is
Dropple is a Creative Operating System built on:
- one infinite canvas
- intent‑first authoring
- capability‑driven UI
- time‑aware documents

It is not:
- a collection of separate editors
- a feature‑first app
- a hardcoded UI system

---

## Core Architecture Laws

### 1. Intent First
Tools emit intent, never mutate state directly.

```
tool → intent → resolver → state
```

This enables:
- Ghost Preview
- AI reasoning
- Deterministic replay

### 2. Capabilities Over Conditionals
UI visibility and power are decided by:
- tool required capabilities
- workspace allowed capabilities
- mode locks

No `if (workspace === 'uiux')` inside tools.

### 3. Three UI Layers Only
- Left → Intent
- Right → State (Inspector)
- Floating → Speed / Context

No fourth layer. Ever.

### 4. UIUX Is the Only v1 Editor
All mutation in v1 happens only in UIUX workspace.

Other workspaces:
- are read‑only
- must feel intentional

### 5. Dropple‑Custom Tools Are Systems
Dropple’s power comes from:
- interpretation
- preview
- explanation

Not from adding buttons.

---

## Adding a New Tool (Checklist)
Before adding a tool:
- What capability does it require?
- Which UI layer does it belong to?
- Is it foundational or Dropple‑custom?
- Does it mutate or suggest?
- Does it violate v1 lock?

If unsure → do not implement.
