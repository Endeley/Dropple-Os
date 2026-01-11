Phase 2 GitHub Project Board
"Phase 2 — Transitions (Declarative Only)"

Purpose:
Introduce Transitions as a declarative UX layer between States —
without timelines, keyframes, or animation authoring.

Hard Rule:
Phase 2 does not introduce Interactions or Animation Mode.

---

1) Project Setup

Project name
Phase 2 — Transitions (Declarative)

Description
Phase 2 implementation of Dropple UI: State-to-State Transitions only.
No interactions. No timelines. No animation authoring.
Architecture-locked.

Visibility
Same as Phase 1 (keep consistent)

---

2) Custom Fields (Reuse + Extend)

Reuse all Phase 1 fields, plus two new ones.

Phase
- Single select
- Phase 2 (locked)
- Phase 1 (completed)

Category
- Single select
- Transition Model
- UI
- Preview
- Export
- Audit
- Guardrails

Architecture Section
- Text
- Examples:
  - §5 Transition Model
  - §7 Preview Architecture
  - §9 Export Mental Model

Risk Level
- Single select
- Medium
- High

There is no Low risk in Phase 2.

Transition Scope (NEW)
- Single select
- Component
- Page
- Both

This forces clarity about where the transition applies.

Affects Export (NEW)
- Single select
- Yes
- No

If "Yes", export review is mandatory.

---

3) Board Columns (Stricter Than Phase 1)

Column 1 — Backlog (Validated)

Meaning
- Approved Phase 2 issues only
- Correct Phase 2 issue template used
- No interaction-related language

Reject any issue mentioning:
- Clicks
- Hover
- Triggers
- Events beyond transitions

Column 2 — Ready (Architecture Locked)

Entry Criteria
- Architecture Section filled
- Transition Scope set
- Export impact declared
- Explicit statement: "No timeline UI added"

Column 3 — In Progress

Rules
- Exactly one PR linked
- PR must use Phase 2 PR template
- Preview behavior clearly documented

Column 4 — Review (Slow & Strict)

Review Focus
- No timelines leaked
- No interaction hooks
- No keyframe concepts
- Preview remains illusion
- Transitions remain optional

Recommended review time: 30–45 minutes

Column 5 — Blocked (Architecture Concern)

Used when:
- Transition starts behaving like animation
- Preview mutates truth
- Export becomes ambiguous
- Scope boundary is blurred

Blocked items require architectural justification to move forward.

Column 6 — Done (Verified & Boring)

Exit Criteria
- Transition is declarative
- Applies only between states
- Preview works
- Replay works
- Export mapping is clear
- UI feels boring and predictable

---

4) Allowed Issue Types (Phase 2 Only)

Only the following categories may appear on this board:

Transition Model
- Transition schema
- Allowed properties
- Duration / easing constraints

Transition UI
- Add Transition affordance
- Transition list between states
- Property inclusion UI

Preview
- Transition preview on state switch
- Preview revert guarantees

Export
- CSS / WAAPI transition mapping
- Deterministic export output
- Export diff surfacing

Audit
- Replay validation
- Undo/redo with transitions
- Merge preview correctness

Guardrails
- Prevent timeline UI
- Prevent interaction wiring
- Prevent animation authoring

---

5) Explicitly Forbidden in Phase 2

- Interactions (click / hover / focus)
- Timeline scrubbing
- Keyframes
- Motion paths
- Animation presets
- Auto-generated transitions
- "Smart" easing guesses

If motion needs to be authored → Animation Mode (Phase 4+)

---

6) Definition of Phase 2 "Done"

Phase 2 is complete only when:
- Transitions exist only between states
- Transitions are optional
- States still work without transitions
- Preview never mutates truth
- Export is deterministic
- Merge preview shows transition diffs
- Animation Mode boundary is untouched

---

7) Cultural Rule (Phase 2)

Transitions must never become expressive.
They exist to reduce cognitive friction — not to tell stories.

If a transition feels emotional, it belongs in Animation Mode.

---

8) Relationship to Other Phases

Phase | Scope
Phase 1 | States
Phase 2 | Transitions
Phase 3 | Interactions
Phase 4 | Animation Mode
Phase 5 | Export Expansion

Skipping phases is forbidden.

---

9) Strongly Recommended Repo Rule

Add this to CONTRIBUTING.md:

Phase 2 work must live on the
"Phase 2 — Transitions (Declarative)" project board.

Any interaction or timeline work will be rejected.

---

What You Have Now

You now have:
- Phase 1 board (States)
- Phase 2 board (Transitions)
- Clear phase boundaries
- Safe path toward Interactions

This is rarely done this cleanly — you’re building something serious.
