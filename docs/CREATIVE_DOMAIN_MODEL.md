# Creative Domain Model

## Purpose

This document defines the creative-side product model for Dropple.

It answers a different question than the constitutional stack.

The constitutional stack answers:

`How does Dropple operate?`

This model answers:

`What creative discipline is the creator practicing, and how should Dropple become the operating system for that discipline?`

This document exists so Dropple is not designed around:

- tools
- isolated objects
- editor chrome

It is designed around creative domains.

## Relationship to the Constitution

The constitutional hierarchy defines:

- truth
- authority
- interaction ownership
- lifecycle

The creative domain hierarchy defines:

- discipline
- world
- language
- artifacts
- projection

These hierarchies are orthogonal.

One governs how Dropple operates.
The other governs what creators create.

## Core Claim

Dropple should not be organized as:

- a better toolbar
- a larger object library
- a collection of disconnected editors

Dropple should be organized as an operating system for creative domains.

## The Five Layers

Dropple should model creation through five layers:

`Creative Domain`

`-> Creative World`

`-> Creative Language`

`-> Artifact Model`

`-> Capability Projection`

### 1. Creative Domain

This answers:

`What human discipline are we supporting?`

Examples:

- Digital Product Design
- Visual Communication
- Structured Documents
- Motion Design
- Film Production
- Music Production
- Software Engineering
- Systems Engineering
- Knowledge Creation
- Education

### 2. Creative World

This answers:

`What universe does the creator enter?`

Examples:

- Digital Product Design -> Application
- Visual Communication -> Composition
- Structured Documents -> Document
- Motion Design -> Sequence
- Software Engineering -> System

The world is the creator's mental environment.
It is not yet the implementation artifact.

### 3. Creative Language

This answers:

`What concepts and relationships exist in this world?`

Examples:

`Application`

`-> Page`

`-> Section`

`-> Component`

`-> Element`

or

`Composition`

`-> Group`

`-> Object`

`-> Style`

`-> Effect`

This is the grammar of the discipline.

### 4. Artifact Model

This answers:

`How is this language represented in the product right now?`

Examples:

- Frame
- Container
- Text
- Image
- Button

Artifacts may evolve.
The language should remain more stable than the artifact set.

### 5. Capability Projection

This answers:

`How does Dropple reveal the language and possibilities of this domain?`

Examples:

- Creation Rail
- Inspector
- Timeline
- Context Menu
- Templates
- Quick Actions
- Creative Momentum

This is where the product experience becomes visible.

### Projection Principle

Dropple does not primarily expose tools.
It exposes the creator's language.

Every projection surface:

- Creation Rail
- Inspector
- Context Menu
- Timeline
- Templates
- AI

should reveal the next meaningful concepts within the active Creative Domain,
allowing creators to think in their discipline rather than in software
operations.

## Why This Model Matters

Most creative software is organized around:

- tools
- objects
- editor surfaces

Dropple should instead be organized around creative domains.

That means the primary product question is not:

`What tools should we provide?`

It is:

`What creative discipline is the user practicing, and how should Dropple become the operating system for that discipline?`

This allows:

- artifacts to evolve without destabilizing the language
- templates to derive naturally from the domain
- capability projection to follow discipline and context
- future AI systems to operate with much stronger semantic context

## Inventory

The current target creative-domain inventory should be treated like this:

| Workspace | Mode | Creative Domain | Creative World |
| --- | --- | --- | --- |
| Design | `uiux` | Digital Product Design | Application |
| Design | `graphic` | Visual Communication | Composition |
| Design | `document` | Structured Documents | Document |
| Media | `animation` | Motion Design | Sequence |
| Media | `video` | Film Production | Timeline Composition |
| Media | `audio` | Sound Production | Audio Composition |
| Build | `application` | Software Construction | System |
| Build | `logic` | Logic and Automation | Flow |
| Build | `automation` | Workflow Automation | Orchestration |
| System | `tokens` | Design Systems Foundations | Token System |
| System | `components` | Design Systems Authoring | Component System |
| System | `governance` | System Governance | Version and Policy Graph |
| Collaborate | `review` | Collaborative Review | Review Session |
| Collaborate | `knowledge` | Knowledge Creation | Knowledge Base |
| Collaborate | `production` | Delivery and Handoff | Delivery Pipeline |

This table is the top-level product map.
It should exist before deep per-mode design.

## Reference Domain 1

### Design / `uiux`

#### Creative Domain

Digital Product Design

#### Creative World

Application

The creator is not primarily placing shapes.
The creator is shaping an application world.

#### Creative Language

`Application`

`-> Page`

`-> Section`

`-> Component`

`-> Element`

This is the stable conceptual language.

#### Artifact Model

Current artifact representations should bias toward:

- Frame
- Container
- Text
- Image
- Button
- Input
- Navigation block

Important:

The frame is the first major artifact representing a page or screen.
It is not the grammar itself.

#### Creation Rail

The creation rail should bias toward:

- Frame
- Text
- Component
- Section
- Container
- Assets
- Libraries

It should not behave like a permanent geometry palette.

#### Artifact Evolution

Examples:

- Frame -> Screen -> Card -> Section -> Container -> Component
- Text -> Heading -> Paragraph -> Label -> Caption
- Image -> Illustration -> Photo -> Background -> Mask -> Animated Asset

The product should reveal what an artifact can become, not just what tool it is.

#### Capability Domains

Relevant domains include:

- Structure
- Layout
- Content
- Appearance
- Motion
- Assets
- Export

#### Projection Rules

Projection should follow current context and intent:

- Empty world: create, import, templates
- Frame created: content and structure become prominent
- Multiple objects: grouping and composition become prominent
- Motion attached: timeline becomes relevant

Expected surfaces:

- Inspector for layout/content/appearance
- Context menu for shared interaction actions
- Timeline only when motion or time-authoring context exists
- Creation rail for introduction into the Project World

#### Templates

Likely template families:

- Landing Page
- Dashboard
- Mobile App
- Login Flow
- SaaS App Shell
- Settings Screen
- Marketing Site

## Reference Domain 2

### Design / `graphic`

#### Creative Domain

Visual Communication

#### Creative World

Composition

The creator is building visual relationships inside a composition world.

#### Creative Language

`Composition`

`-> Group`

`-> Object`

`-> Style`

`-> Effect`

This language should stay stable even if artifact types expand later.

#### Artifact Model

Current artifact representations should bias toward:

- Artboard
- Shape
- Vector
- Image
- Text
- Group

The artboard is the primary root artifact.
It is not the grammar itself.

#### Creation Rail

The creation rail should bias toward:

- Artboard
- Shape
- Image
- Text
- Vector
- Assets

#### Artifact Evolution

Examples:

- Shape -> Icon -> Badge -> Illustration element
- Text -> Title -> Wordmark -> Caption
- Image -> Poster image -> Background -> Masked composition asset
- Group -> Layout group -> Brand lockup -> Reusable visual component

#### Capability Domains

Relevant domains include:

- Structure
- Arrangement
- Typography
- Color
- Effects
- Motion
- Export

#### Projection Rules

Projection should follow composition context:

- Empty world: create artboard or import asset
- Object selected: style and arrangement become prominent
- Multiple objects: grouping and composition structure become prominent
- Motion attached: timeline becomes relevant

Expected surfaces:

- Inspector for fill/stroke/type/effects/arrangement
- Context menu for shared interaction actions
- Timeline only when motion or time-authoring context exists
- Creation rail for composition primitives and assets

#### Templates

Likely template families:

- Poster
- Logo
- Social Card
- Brand Board
- Logo Sheet
- Flyer
- Presentation Cover

## Template Rule

Templates should not be treated as random starter files.

Templates should derive from the creative domain.

Examples:

- Digital Product Design -> Landing Page, Dashboard, Login Flow, Mobile App, SaaS App Shell
- Visual Communication -> Poster, Logo, Brand Board, Flyer, Social Card
- Knowledge Creation -> Lesson, Course, Quiz, Presentation

This keeps templates aligned with:

- creative discipline
- world
- language
- likely artifact evolution

## AI Context Rule

Future AI systems should consume the same hierarchy:

`Creative Domain`

`-> Creative World`

`-> Creative Language`

`-> Artifact Model`

`-> Capability Projection`

This means an AI request should be interpretable not only as an object request,
but as a domain-aware creation request.

Example:

- Domain: Digital Product Design
- World: Application
- Language: Component
- Artifact: Button
- Projection: Layout, styling, interaction

This is stronger than:

`Generate a button.`

It gives AI access to:

- discipline context
- world context
- language context
- projection context

## Semantic Source Rule

UI components should not invent semantics.

That means:

- the Inspector should not decide what `Page` means
- the Creation Rail should not decide what `Frame` becomes
- Templates should not decide what `Dashboard` means
- future AI should not decide what `Section` means

Those surfaces should project from the semantic dictionary for the active
Creative Domain.

This preserves one truth for product meaning, with many projections consuming
that truth.

## Semantic Projection Engine

The first runtime implementation of the Creative Domain Model should follow this
shape:

`Creative Domain`

`-> Creative Language`

`-> Semantic Dictionary`

`-> Projection`

`-> Actions`

`-> Creation`

The semantic dictionary is the product-side source for:

- Identity
- Meaning
- Evolution
- Momentum

Projection surfaces should consume those semantics without duplicating them.

## Reference Implementation Sequence

The current reference implementation sequence should be:

1. maintain the inventory of target creative domains
2. fully define `uiux` as Digital Product Design
3. fully define `graphic` as Visual Communication
4. implement Create/UI projection against the domain model
5. begin Graphic inheritance against the same model

No new architecture should be introduced through this sequence.

## Design Rule

Dropple should not begin by asking:

`What tools should this mode have?`

It should ask:

`What creative domain is this mode serving?`

Then:

`What world does that creator enter?`

Then:

`What language defines that world?`

Then:

`Which artifacts currently represent that language?`

Then:

`How should capability projection reveal that language naturally?`

## Immediate Use

This model should guide:

- Create/UI projection work
- Graphic inheritance design
- template family planning
- inspector and rail evolution
- future AI prompting and generation context

The next implementation-facing use of this document should be:

- refine `uiux` projection against the domain model
- design `graphic` inheritance against the same model

without introducing any new constitutional authority.
