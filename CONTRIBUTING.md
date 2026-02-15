# Contributing to Dropple

Dropple is a capability-driven Creative OS.
This repo is governed by strict architectural laws.

If you violate them, the system will regress.

---

## Core Principles
1. Tools do NOT know workspaces
2. Capabilities decide visibility and power
3. Intent precedes mutation
4. Inspector is the single source of truth
5. Floating UI is optional and ephemeral
6. No half-working UI is allowed

---

## How Work Is Done
All work must be:
- tracked as a GitHub issue
- created using the provided issue templates
- labeled with exactly one Priority label

No direct commits without an issue.

---

## Adding or Modifying Tools
Before coding, answer:
- What capability does this require?
- Which UI layer does it belong to?
- Does it mutate or only preview?
- Is this v1-allowed?

If unsure — stop.

---

## Ghost Preview Rules (v1)
Ghost systems must:
- never mutate state
- never write history
- never affect selection

Any violation is a blocker.

---

## Breaking Rules
To break a rule you must:
1. Update the UI Lock Document
2. Bump the version
3. Explain the reason in writing

No silent exceptions.

---

## Final Note
Dropple is a system, not a feature set.
Respect the architecture, and velocity follows.
