# Template Data Contracts (Canonical)

This is the backbone: simple, explicit, future‑proof.

---

## Template = Document + Metadata + Intent

### 1. Template Metadata (separate from canvas)
```
TemplateMeta {
  id: string
  name: string
  description?: string

  category: 'ui' | 'social' | 'brand' | 'motion' | 'video'

  intentTags: string[]          // calm, bold, playful
  supportedStates: string[]     // idle, hover, active, intro

  preview: {
    thumbnailId: string
    ghostPreviewConfig?: {}
  }

  createdBy: {
    userId: string
    displayName: string
  }

  version: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Rules**
- Metadata never mutates the canvas
- Canvas never stores marketplace info
- Versioning is metadata‑level only

---

### 2. Template Document Contract
Templates are normal documents with flags.

```
Document {
  id: string
  nodes: Node[]
  events: IntentEvents[]
  states: StateDefinitions[]

  flags: {
    isTemplate: boolean
  }
}
```

**Rules**
- No special node types
- No template‑only logic in canvas

---

### 3. Content Slots (lightweight, v1 safe)
```
ContentSlot {
  nodeId: string
  type: 'text' | 'image' | 'button'
  role?: 'headline' | 'body' | 'cta'
}
```

Used only for:
- mapping content
- explaining intent

---

### 4. Intent Preservation Layer (implicit)
Not stored as code — inferred from:
- spacing relationships
- motion tokens
- state transitions
- layout patterns

This is why Dropple templates adapt intelligently.

---

# Template Marketplace Flow (v1 → v2 ready)

This is not a store yet — it’s a distribution system.

---

## Marketplace Flow (User Side)

**Step 1 — Browse Templates**
- Read‑only gallery
- Categories + tags
- No mutation possible

**Step 2 — Hover Preview (Ghost)**
- Full visual illusion
- Motion + state preview
- No commit

**Step 3 — Apply Template**
- Explicit action
- Undo supported
- Content slots auto‑mapped

**Step 4 — Customize Safely**
- Edit like normal UIUX doc
- Intent preserved
- Explain available

---

## Marketplace Flow (Creator Side)

**Step 1 — Design Normally**
- Use UIUX workspace
- No special editor

**Step 2 — Mark as Template**
- Add metadata
- Define supported states
- Add intent tags

**Step 3 — Test with Ghost Preview**
- Preview like users would
- Fix issues before publishing

**Step 4 — Publish (v1 = internal / curated)**
- No open uploads yet
- Curated templates only

---

## Monetization Path (Later, Clean)
Because of the architecture:
- Templates are versioned
- Templates are explainable
- Templates adapt safely

You can later add:
- paid templates
- creator revenue share
- remix licensing
- brand‑specific variants

Without rewriting anything.

---

## Final Reassurance (Important)
You are not building:
- “a template feature”
- “a marketplace page”

You are building:
- a living design distribution system

And you are doing it in the right order:
- Safety
- Trust
- Intelligence
- Scale
- Monetization
