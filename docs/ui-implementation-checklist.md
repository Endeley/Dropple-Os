UI Implementation Checklist
(Mapped to Dropple Architecture)

Purpose:
This checklist defines the only allowed order and scope for UI implementation related to States, Transitions, and Interactions.

Rule:
A checkbox must be satisfied before moving to the next section.

---

1) UX Architecture Principles

(Architecture §1)

Before Writing UI Code

- [ ] I have read the UX Architecture Principles section
- [ ] I understand that UI must reveal, not invent, system behavior
- [ ] I am not introducing implicit behavior
- [ ] I am not mutating state from UI
- [ ] I am not bypassing dispatcher or session manager

Stop if:
- UI tries to "auto-help" without explicit user intent

---

2) State Model UI

(Architecture §2)

State List UI

- [ ] Display states as named entities
- [ ] Always show exactly one Default state
- [ ] Default state is visually distinct and non-deletable
- [ ] State list is scoped (component or page)

State Editing

- [ ] Switching states is preview-only
- [ ] Editing while in a state commits events to that state only
- [ ] No state mutation occurs on view/switch

Never implement:
- Undo stack as states
- Auto-generated states

---

3) State Scope Enforcement

(Architecture §3)

Component State UI

- [ ] "Add State" appears only when a component is selected
- [ ] Component states are visually grouped under the component
- [ ] No page-level states appear here

Page State UI

- [ ] "Add State" appears only when a page/frame is selected
- [ ] Page states are clearly labeled as global/contextual
- [ ] No component states appear here

Stop if:
- A UI element allows mixing scopes

---

4) State Discovery

(Architecture §4)

Progressive Disclosure

- [ ] No global "States" panel
- [ ] No empty state panels
- [ ] State creation UI appears only when intent exists

State Switching

- [ ] Switching state never emits events
- [ ] Preview state is visually indicated
- [ ] Exit preview returns to last committed state

Never:
- Auto-switch states on selection
- Persist preview state

---

5) Transition UI

(Architecture §5)

Transition Creation

- [ ] "Add Transition" appears only when ≥2 states exist
- [ ] Transition creation requires explicit source and target states
- [ ] Transitions are listed between states, not globally

Transition Controls

- [ ] Allow duration
- [ ] Allow easing
- [ ] Allow property selection
- [ ] No timeline UI
- [ ] No keyframe UI

Stop if:
- Timeline metaphors appear outside Animation Mode

---

6) Interaction UI

(Architecture §6)

Interaction Creation

- [ ] Interaction UI appears only for interactive elements
- [ ] Trigger selection is explicit (click, hover, etc.)
- [ ] Target state selection is required
- [ ] Transition selection is implicit, not manual

Interaction Constraints

- [ ] One interaction → one state change
- [ ] Scope rules enforced in UI
- [ ] Illegal combinations never shown

Never implement:
- Motion inside interaction definitions
- Multi-state triggers

---

7) Preview Architecture

(Architecture §7)

Preview Controls

- [ ] Preview is clearly labeled
- [ ] Preview never commits state
- [ ] Preview never emits events
- [ ] Preview always reverts

Preview Behavior

- [ ] Interactions simulate correctly
- [ ] Transitions apply only if defined
- [ ] Preview uses derived state only

Stop if:
- Preview affects undo history
- Preview leaks into persistence

---

8) Conflict UX

(Architecture §8)

Conflict Discovery UI

- [ ] Conflicts appear only during merge/branch contexts
- [ ] Conflicts never interrupt editing
- [ ] Conflicts are framed as "differences," not errors

Conflict Resolution UI

- [ ] Conflicts resolved at smallest unit possible
- [ ] Users can preview resolution outcomes
- [ ] No auto-merge or silent resolution

Never:
- Resolve conflicts without user intent
- Hide conflict consequences

---

9) Export Mental Model Reinforcement

(Architecture §9)

Export UX Signals

- [ ] Export options reflect workspace capabilities
- [ ] Export preview shows diffs where applicable
- [ ] UI never suggests "best guess" export

Designer Confidence

- [ ] States feel like logic
- [ ] Interactions feel like intent
- [ ] Transitions feel like polish

Stop if:
- Export feels surprising
- Export depends on preview artifacts

---

10) Animation Mode Boundary

(Architecture §10)

Boundary Enforcement

- [ ] Timeline UI appears only in Animation Mode
- [ ] UI/UX mode transitions remain declarative
- [ ] No keyframes outside Animation Mode

Never blur:
- Transition vs animation
- Preview vs truth

---

11) Pre-Merge UI Audit

(Mandatory before merging UI PRs)

Before merging any UI change:
- [ ] Replay still works from scratch
- [ ] Undo/redo still works
- [ ] No direct state mutation exists
- [ ] No implicit behavior added
- [ ] UI behavior is explainable via architecture.md

If any answer is "no", the PR must be rejected.

---

12) Final Implementation Law

If the UI cannot be justified by architecture.md, it must not ship.

This checklist is binding.

---

What This Enables

- Safe incremental UI development
- Multiple contributors without chaos
- Clear PR review standards
- Zero ambiguity between UX and system law
