# Dropple OS — Production Deployment Strategy

## Core Deployment Principles
- Determinism before scale.
- Read-heavy systems scale differently than write-heavy systems.
- One-writer / many-observer simplifies everything.
- Replay is the recovery mechanism.
- AI is asynchronous, never blocking.

## System Decomposition

### A. Frontend (Workspace, Lessons, Player)
Type: Static + dynamic client

Stack: Next.js (App Router), Edge-friendly

Deploy: Vercel / Cloudflare Pages

Responsibilities:
- WorkspaceShell
- Canvas rendering
- Timeline UI
- Education mode
- Lesson player
- Q&A UI

Properties:
- Stateless
- Horizontally scalable
- CDN-friendly

### B. Core Runtime API (Truth Layer)
Type: Stateful, append-only

Stack: Node.js / Bun

Deploy: AWS ECS / Fly.io / Railway

Scaling: Vertical first, then horizontal (sharded by runId)

Responsibilities:
- MessageBus persistence
- Run event storage
- Cursor sync (teacher -> observers)
- Lesson export/import
- Certification issuance

Properties:
- Write-sensitive
- Strong consistency
- Low latency required

### C. AI Services (Async Observers)
Type: Background workers

Stack: Node + queue

Deploy: Separate worker service

Scaling: Independent

Responsibilities:
- AI explanations
- AI Q&A
- AI grading
- Review assistance

Properties:
- Async
- Cost-controlled
- Retryable

### D. Marketplace & Governance API
Type: CRUD + policy engine

Stack: Node / Postgres

Deploy: Same cluster as runtime or separate later

Responsibilities:
- Lesson listings
- Reviews
- Governance state
- Trust signals
- Monetization logic

Properties:
- Read-heavy
- Cacheable

## Data Storage Strategy

### A. Event Store (Critical Path)
Choice: Append-only table or log

Schema:
- events (
  id,
  run_id,
  type,
  payload,
  timestamp,
  author_id
)

Rules:
- Indexed by run_id
- Immutable
- Cursor reconstruction via replay
- Optional checkpoints later

Recommended DB: PostgreSQL (JSONB) initially

### B. Lesson Artifacts
Stored as immutable JSON blobs.

Storage options:
- S3 / R2
- Database JSON

Versioned, never mutated.

### C. Certification Records
Small, structured.

Indexed by:
- learnerId
- lessonId

Signed later if needed.

### D. Caching Layer
Redis / Upstash

Cache:
- Lesson metadata
- Marketplace listings
- Public lesson players

Never cache:
- Event writes
- Cursor truth

## Multiplayer Infrastructure (Live Classrooms)

Transport:
- WebSocket (authoritative teacher channel)
- Server-Sent Events (SSE) for observers (optional)

Scaling Model:
- One teacher -> many observers
- Shard sessions by sessionId
- Stateless observers
- Teacher node is authoritative

Failure Recovery:
- If teacher disconnects, session pauses
- Cursor frozen
- Observers safe
- Replay guarantees recovery

## AI Cost & Safety Strategy

Golden Rules:
- AI never blocks UI
- AI always runs async
- AI output is cached per lesson

Queue-Based Execution:
- BullMQ / SQS / Cloud Tasks
- Retries allowed
- Rate limited per org

Cost Control:
- Default: AI runs on lesson export
- Optional: live explanation (opt-in)
- Hard limits per plan

## Security & Trust

Authentication:
- JWT / session-based

Roles:
- author
- teacher
- reviewer
- learner
- governor

Authorization enforced at:
- Runtime API
- Interaction layer
- Multiplayer guards

Data Integrity:
- Events are append-only
- Lesson artifacts are immutable
- Certificates are verifiable

## Rollout Strategy

### Phase 0 — Internal Alpha
- Single-tenant
- In-memory MessageBus
- No marketplace
- Manual AI runs

Goal: Validate core flows

### Phase 1 — Private Beta (Creators + Teachers)
- Persistent event store
- Lesson export/import
- Education mode
- No live multiplayer yet

Goal: Validate teaching and replay

### Phase 2 — Classroom Beta
- Live teacher + observers
- Annotation sync
- Limited AI explanations

Goal: Validate scale and authority model

### Phase 3 — Public Marketplace
- Lesson listings
- Reviews
- Certification issuance
- Monetization (optional)

Goal: Network effects

### Phase 4 — Enterprise / Institutions
- Org accounts
- Private marketplaces
- Compliance modes
- Audit logs

Goal: Revenue stability

## Observability & Debugging

Logs:
- Event ingestion
- Cursor movement
- Authority violations
- AI job lifecycle

Metrics:
- Events per run
- Replay time
- Lesson completion rates
- Certification pass rates

Debugging:
- Any bug can be replayed

## Disaster Recovery

Why it works:
- Events are immutable
- Lessons are artifacts
- State is reconstructable

Recovery options:
- DB loss (from backups)
- Server crashes
- Partial corruption

Replay is the backup.

## Team & Ops Reality Check

Lean team possible:
- 1–2 backend engineers
- 1 frontend engineer
- 1 infra-aware founder

Because:
- No CRDTs
- No merge conflicts
- Clear authority model

## Founder-Level Summary

You have a platform that is:
- Deterministic
- Replayable
- Auditable
- Teach-able
- Certifiable
- Governable
- Scalable

Most teams add these later. Dropple starts with them.
