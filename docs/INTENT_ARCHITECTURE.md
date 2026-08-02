# Intent Architecture

Status: Frozen governance artifact  
Date: 2026-07-30  
Scope: Constitutional model for how intent flows through Dropple from session creation to active runtime behavior  
Authority: Governance artifact subordinate to `CREATIVE_START_1_0.md`, `LAUNCH_PRODUCER_CONTRACT.md`, `WORKSPACE_LAUNCH_CONTEXT_SPEC.md`, and constitutional runtime law

## Intent Philosophy

Intent is an expression of desired change, never ownership of truth.

Dropple uses intent at multiple constitutional layers.

Those layers must not be conflated.

### Layer 1 — Creative Intent

Purpose:

Resolve why the session should exist.

Authority:

Creative Start

Output:

Resolved creator session direction, then canonical `WorkspaceLaunchContext`
through the producer pipeline

Truth Owner:

Launch Producers

Consumed By:

Workspace

Status:

Product architecture

### Layer 2 — Interaction Intent

Purpose:

Resolve what should happen during an active session.

Authority:

Runtime intent bridges and canonical UI intent surfaces

Output:

Dispatcher-routable intent events and action requests

Truth Owner:

Runtime reducers and canonical runtime state

Consumed By:

Runtime state and projection layers

Status:

Runtime architecture

## Intent Matrix

| Intent Layer | Purpose | Authority | Output | Truth Owner | Consumer | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Creative Intent | Resolve session purpose | Creative Start | Resolved creator direction | Creative Start until handoff | Launch Producers | Partial |
| Launch Truth | Freeze resolved session | Launch Producers | `WorkspaceLaunchContext` | Launch Producer | Workspace | Complete |
| Workspace Consumption | Consume launch truth | Workspace Root / Workspace Session | Active session identity | Workspace Session | Workspace Runtime | Complete |
| Interaction Intent | Resolve editing and runtime operations | UI intent surfaces and bridges | Dispatcher requests / canonical intent events | Runtime reducers | Runtime state | Complete |

## Intent Lifecycle

The full lifecycle is:

Creator  
↓  
Creative Intent  
↓  
Creative Start Resolution  
↓  
Launch Producer  
↓  
`WorkspaceLaunchContext`  
↓  
Workspace Boot  
↓  
Interaction Intent  
↓  
Dispatcher  
↓  
Reducers  
↓  
Runtime Truth

This lifecycle explains the whole system:

- before workspace boot, intent is about session meaning
- at launch, intent becomes canonical launch truth
- after workspace boot, intent becomes runtime behavior requests

## Constitutional Laws

### Law 1 — Creative Intent Before Boot

Creative Intent must be resolved before workspace boot.

The workspace must not infer why the session should exist after launch.

### Law 2 — Launch Truth Is Canonical

`WorkspaceLaunchContext` is immutable launch truth for session initialization.

Launch truth is explicit, not reconstructed.

### Law 3 — Workspace Must Not Reconstruct Creator Intent

Workspace runtime must never derive:

- language
- category
- blueprint
- template
- grammar
- certification

from routes, component memory, marketplace browsing state, or downstream UI
inference once canonical launch truth exists.

### Law 4 — Interaction Intent Must Not Mutate Truth Directly

Interaction Intent may express desired change.

It may not mutate runtime truth directly.

UI emits intent.

Bridges and dispatcher pathways translate it.

Reducers remain truth owners.

### Law 5 — Launch Producers Translate Creator Intent Into Launch Truth

Launch Producers exist to convert resolved creator intent into lawful,
deterministic `WorkspaceLaunchContext`.

They do not own workspace boot or runtime state.

### Law 6 — Layer Ownership Must Remain Distinct

Creative Start owns creator intent.

Launch Producers own launch truth.

Workspace consumes launch truth.

Runtime intent bridges express interaction intent.

Reducers own runtime truth.

## Layer Specifications

### Layer A — Creative Intent

#### Purpose

Creative Intent answers:

Why should this session exist?

It is the creator-facing meaning layer that precedes workspace launch.

#### Canonical Owner

Creative Start

#### Inputs

- creator entry path
- language family choice
- blueprint category choice
- blueprint choice
- template choice

#### Output

Resolved creator direction ready for canonical launch production.

Creative Intent does not directly own workspace boot.

#### Current Implementation

Implemented:

- homepage creator-start actions now hand into Creative Start surfaces intentionally
- Marketplace acts as the first Creative Start resolution surface
- language-family and blueprint-category narrowing are explicit product states

Partial:

- the full `Language → Blueprint Category → Blueprint → Template → Workspace` flow is not yet complete
- the current catalog still reflects canonical workspace families more strongly than the finer language taxonomy

#### Remaining Work

- separate Blueprint and Template choice more explicitly
- complete final creator-resolution handoff into canonical launch truth
- align catalog structure more closely to the full language model

### Layer B — Launch Truth

#### Purpose

Launch Truth answers:

What exact session should be booted?

#### Canonical Owner

Launch Producers

#### Inputs

- resolved creator intent
- producer-owned identity
- blueprint identity
- template identity
- category identity
- grammar identity
- certification or provenance truth
- continuation truth for resumed sessions

#### Output

One immutable `WorkspaceLaunchContext`

#### Current Implementation

Implemented:

- Homepage Producer
- Template Producer
- Blueprint Producer
- Recent Work Producer

These producers now emit canonical launch truth and are protected by
architecture guards.

#### Remaining Work

- future producers such as AI, Import, and additional marketplace paths must conform to the frozen producer contract

### Layer C — Workspace Consumption

#### Purpose

Workspace Consumption answers:

How does the workspace begin without reinterpretation?

#### Canonical Owner

`WorkspaceRoot` and `WorkspaceSession`

#### Inputs

- `WorkspaceLaunchContext`

#### Output

- active workspace session identity
- deterministic runtime boot state

#### Current Implementation

Implemented:

- `WorkspaceRoot` receives canonical launch truth
- `WorkspaceSession` exposes runtime session truth
- runtime shells consume session truth instead of reconstructing it from routes

#### Remaining Work

- no major architectural work remains in this layer unless future evidence exposes a contradiction

### Layer D — Interaction Intent

#### Purpose

Interaction Intent answers:

What should happen next inside an already active workspace?

This is not creator-start resolution.

This is runtime mutation intent.

#### Canonical Owner

UI intent surfaces and runtime intent bridges

#### Inputs

- editing actions
- viewport actions
- history actions
- creation actions
- timeline actions
- graph actions

#### Output

- canonical intent events
- dispatcher-routable action envelopes
- reducer-owned truth changes

#### Current Implementation

Implemented:

- UI intent modules emit intent only
- bridges and dispatcher pathways own translation
- reducers own truth mutation

#### Remaining Work

- future UI features must continue to emit intent without bypassing canonical mutation pathways

## Boundary Rules

### Rule 1 — Creative Intent Is Not Launch Truth

Creative Start may resolve creator choices.

It does not become runtime truth until a Launch Producer emits canonical
`WorkspaceLaunchContext`.

### Rule 2 — Launch Truth Is Not Workspace Consumption

Launch Producers end at handoff.

They do not own workspace boot.

### Rule 3 — Workspace Consumption Is Not Interaction Intent

The workspace consumes session truth at boot.

Once active, runtime interaction follows the separate dispatcher/reducer intent
pipeline.

### Rule 4 — No Downstream Reconstruction

No downstream subsystem may recreate producer-owned launch truth from:

- routes
- query strings
- component memory
- marketplace browsing state
- shell-local inference

### Rule 5 — No Upstream Runtime Leakage

Creative Start may not import or depend on workspace runtime internals to
resolve creator intent.

## Implementation Matrix

| Layer | Canonical Docs | Runtime / Code Ownership | Verification Surface | Status |
| --- | --- | --- | --- | --- |
| Creative Intent | `CREATIVE_START_1_0.md`, `CREATIVE_SESSION_RESOLUTION_ROADMAP.md` | `app/ProjectHomeClient.jsx`, `app/marketplace/page.js` | product flow review | Partial |
| Launch Truth | `LAUNCH_PRODUCER_CONTRACT.md`, `WORKSPACE_LAUNCH_CONTEXT_SPEC.md` | `runtime/workspaces/homepageLaunch.js`, `runtime/workspaces/templateLaunch.js`, `runtime/workspaces/blueprintLaunch.js`, `runtime/workspaces/recentWorkLaunch.js` | producer tests and architecture guards | Complete |
| Workspace Consumption | `WORKSPACE_LAUNCH_CONTEXT_SPEC.md` | `WorkspaceRoot`, `WorkspaceSession`, active shells | session authority tests | Complete |
| Interaction Intent | constitutional runtime law, `DEV_GUIDE.md` | UI intent modules, bridges, dispatcher, reducers | runtime architecture suite | Complete |

## Evaluation Checklist

Every future feature touching this area should be checked against these
questions:

1. Is this creator intent, launch truth, workspace consumption, or interaction intent?
2. Which layer owns it canonically?
3. Is it producing a new `WorkspaceLaunchContext`, consuming one, or operating after boot?
4. Is any subsystem inferring truth it does not own?
5. Does this preserve the separation:
   Creative Start → Launch Producer → Workspace Session → Runtime Interaction?

## Final Law

Creative intent is not where the creator clicked.

It is the resolved reason the session should exist.

Launch truth is the canonical contract that carries that reason into the
workspace.

Interaction intent begins only after the workspace is already alive.
