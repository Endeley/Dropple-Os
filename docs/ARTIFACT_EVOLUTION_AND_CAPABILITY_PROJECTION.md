# Artifact Evolution and Capability Projection

## Purpose

This document defines how already-existing capabilities should be exposed in
the product during Era II through artifact evolution and contextual capability
projection.

It is not a constitutional document.

It is an implementation guide for turning constitutional capability ownership
into rendered product exposure without turning Dropple back into a
toolbar-heavy editor.

The problem it solves is:

- the runtime already contains many capabilities
- the UI does not reveal them at the right time
- users can perform some actions only if they already know they exist
- the product can still drift into tool-first thinking instead of intent-first
  thinking

This guide standardizes how capability exposure should work in the
Create/UI reference implementation and in every inherited mode that follows.

## Scope

This guide covers:

- shared interaction capabilities
- cross-mode capabilities
- grammar capabilities
- views and panels
- contextual exposure rules
- artifact evolution guidance

It does not create new authorities.

It does not create new permanent toolbars.

It does not redefine the constitutional stack.

## Experience Principle

Dropple should think in terms of user intent, not tool inventory.

The question is not:

`What tools should be visible?`

The question is:

`What is the user trying to accomplish right now?`

This means capability projection should usually be experienced as:

- possibility
- evolution
- stage-aware guidance
- next meaningful action

not:

- button density
- permanent controls
- editor chrome

## Projection Model

Capability exposure follows this chain:

`Project World`

`-> Current Context`

`-> Current Intent`

`-> Creative Stage`

`-> Artifact Evolution Possibilities`

`-> Creative Momentum`

`-> Relevant Capability Domains`

`-> Relevant Capabilities`

`-> Relevant Controls`

The system must not project capabilities like this:

`Toolbar -> everything`

## Creative Journey Principle

Dropple should reveal capabilities not only according to artifact context, but
also according to the creator's current stage in the creative journey.

This is not a constitutional law.

It is an experience-layer interpretation guide.

It helps the product answer not only:

`What can this artifact become?`

but also:

`Where is the creator in the journey right now?`

### Universal Creative Stages

These stages are expected to recur across modes:

`Discover`

- nothing exists yet
- the project world is calm

`Create`

- first artifacts appear
- the system teaches possibility

`Build`

- relationships appear
- structure, grouping, layout, and composition become relevant

`Refine`

- consistency, constraints, variants, motion, and polish become relevant

`Review`

- comments, validation, accessibility, and knowledge become relevant

`Deliver`

- export, publish, share, versioning, and handoff become relevant

## Creation Rail Principle

The left rail should be treated as the `Creation Rail`, not as a traditional
toolbar.

Its job is to answer one question:

`How do I bring something into the Project World?`

It should not try to expose everything that can later be done to an artifact.

That later capability should be projected from:

- context
- intent
- creative stage
- artifact evolution
- creative momentum

### Creation Rail Law

The left rail introduces things into the Project World.

It does not expose everything that can be done to them afterward.

### Creation Rail Guidance

The rail should prefer creative entry points over primitive geometry.

For example, in `UIUX`, the rail should bias toward:

- Create
- Assets
- Components
- Libraries

not a permanent list of geometric primitives.

The interaction stays shared.

The grammar decides what can be created.

Examples:

`Create -> UIUX`

- Frame
- Text
- Component
- Section
- Container

`Create -> Graphic`

- Artboard
- Shape
- Image
- Text
- Vector

`Create -> Document`

- Page
- Heading
- Paragraph
- Media

This keeps the rail aligned with mode grammar rather than primitive geometry.

## Creative Momentum Principle

The interface should always make the next meaningful action easier than
searching for it.

This does not mean the system should try to predict everything.

It means the system should reduce friction around the most likely next
meaningful step in the creator's flow.

Examples:

`Empty World`

- momentum: start creating

`Frame Created`

- momentum: give it content

`Content Added`

- momentum: organize it

`Multiple Objects`

- momentum: structure them

`Structure Exists`

- momentum: refine it

`Motion Added`

- momentum: preview it

`Project Complete`

- momentum: review and deliver

Creative momentum is an experience-layer rule.

It does not create new runtime ownership.

It helps decide which capabilities should become easier to discover next.

## Artifact Evolution Law

Every artifact should progressively reveal what it is capable of becoming.

It should not primarily reveal what tools exist.

Examples:

`Frame`

`-> Screen`

`-> Card`

`-> Container`

`-> Component`

`-> Interactive Component`

`Text`

`-> Heading`

`-> Paragraph`

`-> Label`

`-> Caption`

`Image`

`-> Photo`

`-> Background`

`-> Mask`

`-> Animated Asset`

This law does not create new runtime authorities.

It changes how existing capabilities are exposed:

- through possibilities first
- through domains second
- through individual controls last

## Projection Rules

### Rule 1

Capabilities are projected by context, not by permanent chrome.

### Rule 2

Intent is more important than individual controls.

The interface should first infer:

- what the user is trying to make
- what the selected artifact can become

and only then reveal controls.

### Rule 3

Creative stage helps determine which capabilities should become prominent
first.

The same artifact may expose different domains depending on whether the
creator is:

- starting
- building
- refining
- reviewing
- delivering

### Rule 4

Creative momentum determines which projected capability should feel easiest to
take next.

The question is not:

`Which tool should I show?`

It is:

`What is the most meaningful next step for this creator right now?`

### Rule 5

Domains are more stable than individual controls.

The UI should usually reveal:

- a relevant domain
- then the relevant controls inside that domain

not every possible action at once.

### Rule 6

Modes do not project different interaction authorities.

Modes project different grammar capabilities.

### Rule 7

Views and panels expose capabilities.

They do not own those capabilities.

### Rule 8

Timeline eligibility derives from time-authoring context.

It does not derive from selection alone.

### Rule 9

When the first artifact is created, Dropple should progressively reveal the
capabilities that are relevant to that artifact.

It should not respond by crowding the UI with permanent buttons.

Artifact selection should project contextual capability domains such as:

- Content
- Appearance
- Layout
- Structure
- Motion
- Assets
- Export

The goal is discoverability through projection and evolution, not through
permanent chrome.

## Context States

### Empty World

Context:

- no artifacts
- no selection

Expose:

- Project
- Create
- Import
- Templates (future)

The experience should feel like:

`What do you want to create?`

Hide:

- Inspector
- Timeline
- structural actions
- artifact-only capability domains

The empty world should feel open, not preloaded with editing controls.

The dominant stage is:

`Discover`

### Worked World, No Active Artifact

Context:

- project history exists
- no selection

Expose:

- world navigation
- create actions
- top-level menus

Hide:

- Inspector
- Timeline
- selection-only structural actions

The likely stage is:

`Create` or early `Build`

### Single Artifact Selected

Context:

- one inspectable artifact selected

This is the first major capability-projection state.

When the first artifact is created and selected, Dropple should begin teaching
the user what that artifact can become by revealing relevant domains before
revealing every possible control.

The experience should feel like:

`This artifact can become something more.`

The likely stage is usually:

`Create` moving into `Build`

Expose relevant domains:

- Content
- Identity
- Appearance
- Layout
- Structure
- Motion
- Assets
- Semantic
- Accessibility
- Export

Possible next states may also be projected as intent-level prompts.

Examples:

- this frame can become a card
- this frame can become a screen
- this frame can become a container

Only controls relevant to the selected artifact should appear.

The projection sequence should be:

- first artifact exists
- artifact selected
- artifact possibilities become legible
- relevant domains become visible
- domain controls appear only when the domain is relevant

### Multi-Selection

Context:

- two or more artifacts selected

Expose:

- Structure
- Layout
- Appearance where valid

Structure becomes richer:

- Group
- Ungroup where valid
- Align
- Distribute
- Wrap (future)

The user intent here is usually arrangement or structure, not isolated editing.

The likely stage is:

`Build`

### Time-Authoring Context

Context:

- motion exists for selected artifact
- or a time-authoring tool is active

Expose:

- Timeline
- motion controls

Hide timeline when:

- no motion exists
- and no active time-authoring tool exists

The likely stage is:

`Refine`

## Surfaces

The current Create/UI reference implementation uses these exposure surfaces:

- `Creation Rail`
- `Top Bar`
- `Edit/View` menus
- `Context Menu`
- `Inspector`
- `Timeline`

These should be treated as projection surfaces rather than generic UI regions.

### Surface Roles

`Creation Rail`

- authoring entry points
- grammar creation tools
- introduction-to-world projection surface
- mode-grammar creation surface

`Top Bar`

- project-level actions
- history access
- menu access
- project projection surface

`Context Menu`

- quick contextual actions
- action projection surface

`Inspector`

- inspectable capability domains
- edit surfaces for the active artifact
- progressive capability reveal for the selected artifact
- possible artifact evolution guidance when relevant
- capability projection surface

`Timeline`

- time-authoring surface only
- time projection surface

`Canvas`

- spatial projection surface

`Navigator` (future)

- world projection surface

## Capability Domains

The domains below are stable projection categories.

- Content
- Identity
- Appearance
- Layout
- Structure
- Motion
- Assets
- Behavior
- Export
- Accessibility
- Semantic

Not every mode will use every domain equally.

Modes inherit the same projection model and expose only the domains relevant
to their grammar.

The domains are not the first thing the user should feel.

They are the structured way the product expresses:

- what this artifact is
- where the creator is in the journey
- what it can become
- what the next meaningful step is
- what the user can do next

## Capability Table

| Capability | Constitutional Owner | Capability Domain | Trigger | Primary Surface | Secondary Surface | Hide Rule | Available In |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Creative Stage Hint | Experience-layer projection using existing authorities | Behavior | Project and artifact context imply a dominant creative stage | Inspector | Future world guidance surfaces | Hide when stage inference would add noise or duplicate obvious context | All modes |
| Creative Momentum Hint | Experience-layer projection using existing authorities | Behavior | Context, intent, and stage imply an obvious next meaningful action | Inspector | Future contextual create surfaces | Hide when no meaningful next step can be inferred without guessing | All modes |
| Artifact Evolution Prompt | Mode Grammar using shared surfaces | Content / Structure / Motion / Assets | Inspectable artifact selected and the next likely artifact states are meaningful | Inspector | Future command palette or contextual create surface | Hide when the artifact has no meaningful next-state suggestions | All modes with inspectable artifacts |
| Select | Shared Interaction Authority | Structure | Pointer hit on artifact | Canvas | Inspector status | Hide when no artifact exists | All modes |
| Multi-select | Shared Interaction Authority | Structure | Shift-select or marquee across multiple artifacts | Canvas | Context Menu | Hide when selection count < 2 | All modes |
| Drag | Shared Interaction Authority | Structure | Draggable artifact selected and pointer drag begins | Canvas | Inspector position feedback | Hide when nothing draggable is selected | All modes |
| Resize | Shared Interaction Authority | Layout | Resizable artifact selected and handle drag begins | Canvas | Inspector size fields | Hide when artifact is not resizable | All modes |
| Delete | Shared Interaction Authority | Structure | Artifact selection exists | Context Menu | Edit menu, keyboard | Hide when selection count = 0 | All modes |
| Undo | Shared Interaction Authority | Structure | History stack can step backward | Top Bar | Keyboard | Hide or disable when no undo entry exists | All modes |
| Redo | Shared Interaction Authority | Structure | History stack can step forward | Top Bar | Keyboard | Hide or disable when no redo entry exists | All modes |
| Group | Shared Interaction Authority | Structure | Selection count >= 2 and selection is groupable | Context Menu | Edit menu, inspector actions | Hide when selection count < 2 | All modes |
| Ungroup | Shared Interaction Authority | Structure | Primary selection is a group artifact | Context Menu | Edit menu, inspector actions | Hide when primary selection is not a group | All modes |
| Duplicate | Shared Interaction Authority | Structure | Selection exists | Edit menu | Keyboard, future context menu | Hide when selection count = 0 | All modes |
| Return Home | Project World | Identity | User requests navigation reset | View menu | World control, keyboard future | Hide when Home is unavailable | All modes |
| Attach Motion | Cross-Mode Capability | Motion | Motion-capable artifact selected and no motion clip attached | Inspector | Context Menu, Edit menu | Hide when selection is empty, grouped-only, or motion already exists | UIUX, Graphic, Document, Animation, Video, Audio, Application |
| Remove Motion | Cross-Mode Capability | Motion | Motion-capable artifact selected and motion clip exists | Inspector | Context Menu, Edit menu | Hide when no motion exists for selection | UIUX, Graphic, Document, Animation, Video, Audio, Application |
| Timeline | Cross-Mode Capability | Motion | Motion exists on selected artifact or time-authoring tool is active | Bottom Timeline Panel | Inspector motion section | Hide when no motion exists and no time-authoring tool is active | UIUX, Graphic, Document, Animation, Video, Audio, Application |
| Semantic Tagging | Shared Capability / Artifact Metadata | Semantic | Inspectable artifact selected | Inspector | Future context action | Hide when no inspectable artifact exists | UIUX, Graphic, Document, Application |
| Accessibility Metadata | Shared Capability / Artifact Metadata | Accessibility | Inspectable artifact selected | Inspector | Future validation panel | Hide when no inspectable artifact exists | UIUX, Graphic, Document, Application |
| Export | Mode Grammar or Cross-Mode Capability | Export | Exportable artifact or project context exists | Inspector | File menu, Publish surface | Hide when nothing exportable is selected and project export is unavailable | UIUX, Graphic, Document, Animation, Video, Audio |
| Content Controls | Mode Grammar | Content | Content-bearing artifact selected | Inspector | Creation Rail or authoring menu | Hide when selected artifact has no content model | UIUX, Graphic, Document, Application |
| Position Editing | Mode Grammar using shared artifact fields | Identity | Inspectable artifact selected | Inspector | Canvas selection overlay | Hide when no inspectable artifact exists | All spatial modes |
| Size Editing | Mode Grammar using shared artifact fields | Layout | Resizable artifact selected | Inspector | Canvas selection overlay | Hide when artifact is not resizable | All spatial modes |
| Layout Controls | Mode Grammar | Layout | Layout-capable artifact selected | Inspector | Top Bar authoring menus | Hide when selected artifact does not support layout | UIUX, Graphic, Application |
| Appearance Controls | Mode Grammar | Appearance | Style-capable artifact selected | Inspector | Future quick style surfaces | Hide when selected artifact has no appearance properties | UIUX, Graphic, Document |
| Asset Attachment | Cross-Mode Capability or Mode Grammar | Assets | Asset-capable artifact selected or asset insertion context active | Inspector | Creation Rail, authoring menu | Hide when active grammar does not support assets | UIUX, Graphic, Document, Video, Audio |
| Text Authoring | Mode Grammar | Behavior | Text tool active or text artifact selected | Creation Rail | Top Bar authoring controls | Hide when active mode does not support text | UIUX, Graphic, Document |
| Frame Authoring | Mode Grammar | Structure | Frame-capable grammar active | Creation Rail | Top Bar authoring controls | Hide when active mode does not support frames | UIUX, Graphic |
| Create Entry | Mode Grammar using shared interaction | Structure / Content | User wants to introduce a new artifact into the world | Creation Rail | Command palette, top-level create menu | Hide only when creation is not allowed in the current mode | All creation-capable modes |

## Surface-by-Surface Guidance

### Context Menu

Use for quick contextual actions only.

Current Create/UI expectations:

- Delete
- Group
- Ungroup
- Attach Motion
- Remove Motion

Do not use it to own action behavior.

It is a projection surface only.

### Inspector

Use for inspectable capability domains.

The inspector should not be a permanent dumping ground for every possible
control.

It should reveal:

- only domains relevant to the active artifact
- only controls relevant to those domains
- when useful, which stage of work the user is likely in
- when useful, the next meaningful artifact evolutions
- when useful, the next meaningful action

For motion specifically:

- if no motion exists, show `No motion attached` and `Attach Motion`
- if motion exists, show `Remove Motion` and motion-related fields

### Top Bar

Use for:

- history actions
- project actions
- menu access
- lightweight authoring entry points

Do not use it as a permanent capability dump.

### Creation Rail

Use for introducing things into the Project World.

Its primary responsibility is creation entry, not permanent exposure of all
available editing capability.

Prefer:

- Create
- Assets
- Components
- Libraries

over long lists of primitive geometry tools.

The rail should speak the language of the active mode grammar.

Examples:

`UIUX`

- Frame
- Text
- Component
- Section
- Container

`Graphic`

- Artboard
- Shape
- Image
- Text
- Vector

`Document`

- Page
- Heading
- Paragraph
- Media

Do not use it for contextual actions like Delete or Group.

Do not use it to explain what a selected artifact can become.

Do not use it as a permanent capability dump.

### Timeline

Use only when time becomes relevant.

The bottom panel must not appear just because a frame is selected.

It becomes eligible only when:

- motion exists
- or time-authoring is active

## Mode Inheritance Guidance

Modes inherit:

- Project World
- Shared Interaction Authorities
- Surface Context Law
- Motion Law
- this projection model

Modes change:

- grammar
- artifact meaning
- domain vocabulary

Modes do not change:

- selection ownership
- delete ownership
- drag ownership
- resize ownership
- history ownership
- timeline eligibility law

## Reference Projection for Create/UI

### Empty World

Expose:

- Home
- Create grammar entry points through the Creation Rail
- Top Bar menus

The primary user question is:

`What do you want to create?`

The dominant stage is:

`Discover`

Hide:

- Inspector
- Timeline
- structural selection actions

The world should feel open, not preloaded with controls.

### Static Frame Selected

Expose:

- Inspector
- Content where applicable
- Identity
- Layout
- Structure
- Motion domain
- Assets where applicable

Do not expose every possible control immediately.

Project the domains first, then the controls those domains make relevant.

Where useful, also expose what the frame can become next.

The dominant stage is usually:

`Create` or `Build`

Hide:

- Timeline

The Creation Rail should remain focused on bringing new things into the world,
not on exposing all of the frame's editing operations.

### Frame With Motion

Expose:

- Inspector
- Motion domain with remove/edit actions
- Timeline

The dominant stage is usually:

`Refine`

### Multi-Select

Expose:

- Context Menu actions for Group
- Inspector selection actions where applicable

The dominant stage is usually:

`Build`

Hide:

- single-artifact-only actions

## Anti-Patterns

Do not:

- add permanent toolbars for every capability
- duplicate the same action across multiple noisy surfaces without a clear reason
- make a mode own its own interaction authority
- expose timeline from selection alone
- expose inspector without inspectable context
- expose contextual actions as always-on floating world chrome
- expose tools before clarifying the user's likely intent

## Implementation Rule

For every new exposure decision, answer:

1. Which capability is being exposed?
2. Who constitutionally owns it?
3. Which domain does it belong to?
4. What trigger makes it relevant?
5. What is the primary surface?
6. What is the fallback surface?
7. When must it hide?
8. Which modes inherit it?
9. What can the artifact become next?
10. Which creative stage is the user likely in?
11. What is the next meaningful action?

If those answers are unclear, do not add the surface yet.

## Long-Term Goal

The UI should not make the user ask:

`Where is the tool?`

It should make the user feel:

`Given what I am making, where I am in the journey, what this artifact can become, and what the next meaningful step is, Dropple is revealing the capabilities that matter now.`

That is the purpose of artifact evolution and capability projection.
