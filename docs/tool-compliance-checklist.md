✅ Tool Compliance Checklist (Dropple OS)

Applies to:
Animate Between States
Smart Motion Presets
Motion From Interaction
(and all future authoring tools)

Passing all checks is mandatory.
A single ❌ is a hard stop.

1️⃣ Intent & Responsibility

 Tool emits intent only (never mutates state)

 Tool does not execute animation

 Tool does not interpret timeline or keyframes

 Tool does not perform layout, preview, or rendering

 Tool does not generate IDs

✅ Pass condition: tool code is stateless and side-effect free

2️⃣ Dispatcher & Event Safety

 Tool does not call reducers

 Tool does not bypass dispatcher

 Tool emits explicit events only

 Tool emits no compound events

 Tool never dispatches during replay

✅ Pass condition: dispatcher remains the single mutation gate

3️⃣ Runtime Truth Integrity

 Tool never calls setRuntimeState

 Tool never reads or writes runtime truth

 Tool never modifies history

 Tool never affects undo/redo behavior

 Tool is replay-safe by construction

✅ Pass condition: replaying events reproduces identical state

4️⃣ Preview & Illusion Isolation

 Tool does not write to useAnimatedRuntimeStore

 Tool does not depend on preview timing

 Tool remains functional with preview disabled

 Tool behavior is identical in headless mode

✅ Pass condition: preview layer can be removed with no impact

5️⃣ Persistence & Export Safety

 Tool never writes to persistence

 Tool never reads from persistence

 Tool does not affect export output unless explicitly specified

 Tool data is export-neutral unless contract says otherwise

✅ Pass condition: exported output unchanged unless intended

6️⃣ Replay & Determinism

 Tool behavior is deterministic

 Tool respects __isReplaying guard

 Tool performs no async side effects

 Tool produces identical results across replays

✅ Pass condition: replay hash stability

7️⃣ Timeline & Animation Separation

 Tool does not create keyframes implicitly

 Tool does not mutate timeline state

 Tool does not assume timeline presence

 Tool composes cleanly with timeline (if applicable)

✅ Pass condition: timeline can be disabled entirely

8️⃣ Interaction Safety (if applicable)

 Tool motion is ephemeral

 Tool motion cancels on state change

 Tool motion cancels on undo/redo

 Tool motion cancels on replay

 Tool motion never persists

✅ Pass condition: interaction motion leaves no trace

9️⃣ Accessibility & UX Guarantees

 Tool respects reduced-motion preferences

 Tool has a non-motion fallback

 Tool behavior is explainable to users

 Tool does not require animation literacy

✅ Pass condition: usability without motion expertise

🔒 Final Sign-off

 All sections passed

 Tool contract referenced in docs/tool-contracts.md

 No existing contracts violated

 Additive only (no breaking changes)

Result:

✅ APPROVED → Tool may proceed to implementation

❌ REJECTED → Fix before merge
