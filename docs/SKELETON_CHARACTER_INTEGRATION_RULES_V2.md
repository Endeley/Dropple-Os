🦴🤝🎭 Skeleton v2 — Skeleton → Character Integration Rules

Goal: Skeletons, characters, attachments, and animation must compose cleanly, deterministically, and debuggably.

This section defines who owns what, who runs first, and who is never allowed to override whom.

1. One Skeleton per Character (v2 Rule)

A character may have at most one skeleton

A skeleton belongs to exactly one character

Nodes outside a character cannot be influenced by that skeleton

If violated:

Skeleton ignored

Dev warning emitted

No partial application

2. Skeleton Scope

Skeleton affects:

character root

character parts (nodes explicitly bound)

Skeleton never affects:
❌ attachments
❌ unrelated nodes
❌ UI overlays
❌ camera / viewport

3. Integration Order (Hard Contract)

This order is non-negotiable:

1. Runtime truth (nodes)
2. Animation evaluation (keyframes)
3. Skeleton deformation
4. Character constraints (follow / pin / aim)
5. Attachments (props & sockets)
6. Visual debug layers
7. Render


Each step:

consumes previous output

never mutates previous layers

4. Ownership Matrix
System	Owns Data	Can Modify	Notes
Animation	timeline	transforms	FK / IK
Skeleton	bones	deltas	derived only
Character	grouping	offsets	structural
Constraints	rules	deltas	post-skeleton
Attachments	sockets	deltas	final
Render	visuals	none	read-only

No overlaps.

5. Skeleton vs Character Constraints
Character Constraints always win

If both affect the same node:

final = applyCharacter( applySkeleton( node ) )


Skeleton never:

cancels pins

overrides aim

bypasses follow rules

6. Attachments Are Blind to Skeleton

Attachments:

see final node transforms

never know about bones

never feed into skeleton

This prevents:

cyclical dependencies

solver loops

unpredictable math

7. Skeleton + Animation Timeline Rules

Skeleton responds to evaluated animation pose

Skeleton does not read timeline directly

Skeleton does not author keys

Timeline owns time.

8. Selection & Editing Rules
Selection

Selecting a node selects its bone (if bound)

Selecting a bone does not select node by default

Editing

Moving a node with a bound bone:

authors bone keys

not node keys (v2.1)

This is authoring logic only — runtime unchanged.

9. Mixed Characters & Rigs

Allowed:

Multiple characters in one scene

Some characters with skeletons

Some without

Forbidden:

❌ a node bound to two skeletons
❌ skeleton controlling nodes in different characters

10. Failure Isolation

Skeleton failure must not:

break animation

break character constraints

break attachments

crash render

Fallback:

nodes render without skeleton deformation

rest of pipeline continues

11. Debug & Inspection Guarantees

At any render frame, you can ask:

whyIsNodeHere(nodeId)


And get:

[
  'animation',
  'skeleton:boneId',
  'character:follow',
  'attachment:socket'
]


This is crucial for trust.

12. What This Unlocks Immediately

With this integration:

Rigs don’t break existing characters

Animators can mix rigid + skeletal animation

Props stay stable

Debugging stays sane

And all of it:

derived-only

reversible

deterministic
