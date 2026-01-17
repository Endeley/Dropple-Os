✅ N1 Completion Checklist — Collaboration Groundwork

Phase: N1
Purpose: Establish collaboration foundations without introducing live collaboration
Status: This checklist must be fully satisfied before starting N2

1. Conceptual Integrity (Phase Intent)

- Collaboration is explicit, not implicit
- Ownership remains the canonical authority
- Editing is still single-writer
- No assumptions about real-time sync exist
- System supports future collaboration without refactor

2. Roles & Permissions (Critical)

Roles Defined

- owner
- editor
- viewer

Role Semantics

- Owner can manage access and publish
- Editor can open and edit local forks
- Viewer is read-only
- Roles are enforced server-side
- No client-only permission logic

3. Schema Readiness

Required Tables

- documentMembers
- documentInvites

Schema Guarantees

- Owner always exists in documentMembers
- Invites are email-based
- Invite lifecycle is explicit (pending -> accepted / revoked)
- No schema assumes live editing

4. Permission Spine (Single Source of Truth)

- getUserRole(ctx, docId) exists
- All access checks go through this helper
- No duplicated role logic in mutations or queries
- Non-members are correctly rejected

5. Collaboration Mutations

Implemented

- inviteToDocument (owner-only)
- acceptDocumentInvite
- revokeDocumentInvite (optional but recommended)

Behavior

- Duplicate invites prevented
- Accept creates documentMembers entry
- Invites cannot be accepted twice
- Non-owners cannot invite or revoke

6. Editor Role Awareness

- Editor fetches role via server query
- Viewer role forces viewer mode
- Editor role enables editing
- Owner role enables editing
- Direct editor URLs respect role
- No mutation paths accessible to viewers

7. Sharing UI (Invites Panel)

Visibility Rules

- Panel renders only for owners
- Panel renders only when docId exists
- Panel hidden for unsaved documents
- Panel hidden for editors and viewers

UI Scope

- Invite by email
- Role selection (viewer/editor)
- Pending invites list
- Revoke action

Explicit Non-Goals

- No member list yet
- No role-change UI
- No email notifications
- No collaboration copy or claims

8. Runtime Isolation

- No presence logic added
- No cursor sharing
- No intent broadcasting
- No runtime store changes
- No canvas/timeline coupling

Editing behavior must remain unchanged from pre-N1.

9. UX Contract (Phase 6 Alignment)

- No empty panels introduced
- Panels appear only when relevant
- No instructional UI added
- No new modals or banners
- Administrative UI is quiet and contextual

10. Security & Failure Safety

- All permission checks enforced server-side
- No sensitive data leaked to non-owners
- Invalid docId fails safely
- Invite misuse does not corrupt state
- No editor crashes on permission failure

11. Code Quality & Hygiene

- npx convex codegen run
- No unused collaboration exports
- No console errors or warnings
- Diff scoped to N1 concerns
- No TODOs blocking N2

✅ N1 FINAL CERTIFICATION

N1 is complete when:

- All sections above are checked
- No live collaboration behavior exists
- The editor remains stable and deterministic
- The system is ready for presence/cursors without refactor

At this point, you may proceed to:

N2 — Live Collaboration (Presence, Cursors, Intent).
