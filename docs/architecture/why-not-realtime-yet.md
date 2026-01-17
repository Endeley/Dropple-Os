Why Dropple Does Not Support Real-Time Editing (Yet)

Short Answer

Because correctness, clarity, and user trust matter more than novelty, and real-time editing done poorly damages all three.

Dropple deliberately ships live awareness without live mutation until the system, users, and constraints demand more.

This is a conscious architectural choice, not a missing feature.

What Dropple Does Support Today

Dropple already provides:

- Live presence (who is here)
- Live cursors (where they are)
- Live intent (what they are doing)
- Soft locks (what is busy, visually)
- Share links, viewers, forks, and reviews
- Local-first editing with deterministic behavior

This gives users collaboration awareness without sacrificing editing stability.

What "Real-Time Editing" Actually Means

Real-time editing is not just "seeing changes instantly".

It requires:

- Shared authoritative state
- Conflict resolution rules
- Merge semantics
- Shared undo models
- Latency tolerance
- Failure recovery
- Extensive testing across edge cases

Once introduced, it permanently changes the system's complexity class.

Why We Are Not Doing It Yet

1. Local-First Editing Is a Core Value

Dropple is built around this principle:

Editing must feel immediate, deterministic, and resilient, even offline.

Naive real-time editing:

- Introduces latency sensitivity
- Couples UX to network quality
- Makes failures harder to reason about

We refuse to compromise local-first behavior for perceived collaboration speed.

2. Awareness != Authority (And That Separation Is Healthy)

Dropple intentionally separates:

- Awareness (presence, cursors, intent)
- Authority (who can change document state)

This prevents:

- Accidental overwrites
- "Who moved my object?" confusion
- Social friction during creative work

Real-time editing collapses this boundary unless designed very carefully.

3. Conflict Resolution Is a Product Decision, Not Just a Technical One

Every real-time editor must answer questions like:

- What happens if two users resize the same object?
- Which change wins?
- Should users be warned?
- Should undo be personal or global?

These are UX decisions with social consequences, not just merge algorithms.

We will not guess.

4. Real-Time Editing Is Expensive to Get Right

Implementing real-time editing properly requires:

- Operation-based or CRDT-based models
- Extensive test coverage
- Long-term maintenance discipline
- Dedicated performance budgets

At Dropple's current stage, this would slow everything else down.

5. Most Creative Work Is Not Truly Concurrent

In practice:

- Designers take turns
- Reviewers comment asynchronously
- Collaboration is often sequential, not simultaneous

Live awareness already solves the biggest coordination problems without the cost of shared mutation.

What We Chose Instead (For Now)

Dropple implements N2: Live Awareness:

- Users can see who is present
- Users can see where others are working
- Users can see what others are manipulating
- Users can avoid collisions socially

This achieves human coordination without system-enforced coordination.

It's simpler, safer, and surprisingly effective.

When We Would Consider Real-Time Editing

Real-time editing becomes viable when:

- Users explicitly demand it
- Async workflows become a bottleneck
- We have bandwidth to design merge rules carefully
- We can ship it opt-in, not forced
- We can preserve local-first guarantees

Until then, not shipping it is the responsible choice.

What This Means for Contributors

- Do not add document mutations to presence, cursor, or intent code
- Do not assume shared state during editing
- Do not couple UI responsiveness to server acknowledgements
- Treat N2 (awareness) and N3 (editing) as separate phases
- If you think real-time editing is needed, start with design, not code

This Is Not a "Forever No"

It is a "not yet, and not casually".

Dropple's architecture is intentionally designed so that:

- Real-time editing can be added later
- Without rewriting the editor
- Without breaking existing documents
- Without betraying user trust

That is the only acceptable way to do it.

In One Sentence

Dropple values clarity and correctness over speed, and live awareness already solves most collaboration needs without the risks of real-time editing.
