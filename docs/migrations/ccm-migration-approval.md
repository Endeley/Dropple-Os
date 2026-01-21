# CCM Migration Approval Rules

(Who Can Approve What, and When)

Status: Design-locked  
Implementation: ❌ Not yet  
Scope: Governance, trust, marketplace safety

## 1. Purpose

These rules define who is allowed to approve a legacy → CCM migration, under
what conditions, and with what authority.

The goal is to:

- Prevent unsafe or silent migrations
- Protect marketplace trust
- Ensure AI-generated artifacts are reviewable
- Make responsibility explicit

## 2. Core Principle (Non-Negotiable)

Migration authority is about trust, not convenience.

No migration is "just technical." Every migration has product and user impact.

## 3. Approval Roles (Locked)

### 3.1 System (Automated)

Identity: authority.initiatedBy = "system"

Capabilities:

- Run eligibility checks (canConvert)
- Produce rejection or defer reports
- Generate candidate artifacts (never final)

Restrictions:

- ❌ Cannot approve conversions
- ❌ Cannot publish CCM artifacts
- ❌ Cannot remove legacyOnly

System authority is advisory, never final.

### 3.2 AI (Assisted)

Identity: authority.initiatedBy = "ai"

Capabilities:

- Propose CCM artifacts
- Suggest param extraction
- Generate migration reports
- Highlight risks and warnings

Restrictions:

- ❌ Cannot approve conversions
- ❌ Cannot remove legacyOnly
- ❌ Cannot publish to marketplace

AI output is always non-authoritative.

### 3.3 Human — Template Author

Identity: authority.initiatedBy = "human"

Capabilities:

- Request migration
- Review migration reports
- Approve private CCM conversions
- Accept loss or simplification

Restrictions:

- ❌ Cannot approve marketplace publication alone
- ❌ Cannot override validation failures

Authors control their own templates, not the ecosystem.

### 3.4 Human — Marketplace Reviewer (Trusted)

Identity: authority.reviewedBy = <reviewerId>

Capabilities:

- Approve CCM artifacts for marketplace
- Remove legacyOnly flag
- Approve AI-assisted conversions
- Sign off on warnings

Restrictions:

- ❌ Cannot bypass CCM validator
- ❌ Cannot approve non-deterministic artifacts

This role exists to protect buyers and downstream users.

## 4. Approval Matrix (Authoritative)

| Scenario | System | AI | Author | Reviewer |
| --- | --- | --- | --- | --- |
| Reject migration | ✅ | ❌ | ❌ | ❌ |
| Defer migration | ✅ | ❌ | ❌ | ❌ |
| Generate candidate CCM | ❌ | ✅ | ❌ | ❌ |
| Approve private CCM | ❌ | ❌ | ✅ | ❌ |
| Remove legacyOnly | ❌ | ❌ | ❌ | ✅ |
| Publish to marketplace | ❌ | ❌ | ❌ | ✅ |

## 5. Approval Levels

### 5.1 Private Approval

Template becomes CCM-usable only by the author.

Not visible in marketplace.

Still marked as migrated.

Still audited.

Used for:

- Personal projects
- Early testing
- Controlled environments

### 5.2 Marketplace Approval

Additional requirements:

- Human reviewer approval
- No blocker warnings
- All params validated
- Motion fully static
- Runtime flags safe

Marketplace approval is explicit and logged.

## 6. Interaction With Audit Reports

A migration cannot be approved unless:

- A migration audit report exists
- The report outcome is converted
- All blocker reasons are resolved
- Approval metadata is added

Approval metadata example:

authority: {
  initiatedBy: "ai",
  reviewedBy: "reviewer-123",
  approvedAt: "2026-01-21T14:03:11Z"
}

## 7. AI-Specific Safeguards

AI-initiated migrations must:

- Always produce a report
- Always be reviewable
- Never auto-publish
- Never self-approve

AI can suggest. Humans decide.

## 8. Failure & Revocation Rules

If a published CCM artifact is later found to violate rules:

- Marketplace approval can be revoked
- Artifact is unpublished
- Audit trail remains immutable
- Legacy template is untouched
- No retroactive erasure.

## 9. Invariants This Protects

- Marketplace trust
- Legal accountability
- AI safety
- Deterministic runtime behavior
- User expectations

## 10. Final Rule (Hard Lock)

No CCM artifact enters the marketplace without explicit human approval.

Automation stops at the boundary of trust.

## 11. Status

- ✅ Defined
- ✅ Role-based
- ✅ Auditable
- ❌ Not implemented (by design)
