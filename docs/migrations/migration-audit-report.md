# Legacy → CCM Migration Audit Report

Format Specification (Design-Only)

Status: Design-locked  
Implementation: ❌ Not yet  
Audience: Humans, CI systems, reviewers, future tooling

## 1. Purpose

A Migration Audit Report records the outcome of a legacy → CCM conversion
attempt.

Its goals are to:

- Make migration decisions explicit
- Explain why a template was or was not converted
- Preserve trust (especially for marketplace + AI)
- Support CI enforcement and long-term audits

Every migration attempt must produce a report — even on failure.

## 2. Core Principles (Non-Negotiable)

- No silent success
- No silent failure
- No implicit assumptions
- No mutation without a report
- Reports are append-only (historical truth)

## 3. Report Identity

Every report has a stable identity:

reportId: string        // UUID  
createdAt: string       // ISO timestamp

## 4. Input Section (What Was Evaluated)

input: {
  legacyTemplateId: string;
  legacyTemplateVersion?: string;
  source: "manual" | "batch" | "ci" | "ai-assisted";
}

Purpose:

- Tie the report to a specific legacy artifact
- Prevent ambiguity when templates evolve

## 5. Decision Section (Single Source of Truth)

decision: {
  outcome: "converted" | "rejected" | "deferred";
  legacyOnly: boolean;
}

Rules:

- converted → produces a CCM artifact
- rejected → cannot be converted under CCM v1
- deferred → technically possible later, but blocked now
- legacyOnly: true must be set on rejected/deferred templates

## 6. Reasons Section (Machine-Readable)

reasons?: Array<{
  code:
    | "NON_DETERMINISTIC_BEHAVIOR"
    | "INTERACTIONS_PRESENT"
    | "RUNTIME_LAYOUT_MUTATION"
    | "UNSUPPORTED_MOTION"
    | "STRUCTURE_INVALID"
    | "AMBIGUOUS_PARAMS"
    | "EDITOR_ONLY_CONSTRUCTS"
    | "UNKNOWN_LEGACY_FEATURE";
  severity: "blocker" | "warning";
}>;

Rules:

- At least one blocker is required for rejection
- Warnings may exist even on success
- Codes are locked (shared with converter interface)

## 7. Human Explanation Section (Required)

explanation: {
  summary: string;
  details?: string;
}

Guidelines:

- Written for a non-engineer
- No internal jargon
- Explains what prevented conversion, not how to fix it
- Safe to surface in UI

Example:

"This template relies on interaction-based animations that cannot be
represented in CCM v1, which only supports static motion timelines."

## 8. Conversion Output (Only on Success)

output?: {
  ccmArtifactId: string;
  ccmArtifactVersion: string;
  engine: string;
  checksum?: string;
}

Rules:

- Present only if outcome === "converted"
- Artifact must already pass validateTemplateArtifact
- Checksum enables later tamper detection

## 9. Warnings Section (Optional, Non-Blocking)

warnings?: Array<{
  code: string;
  message: string;
}>;

Examples:

- "Layout information was simplified"
- "Some values were inlined instead of parameterized"

Warnings never block conversion but must be visible.

## 10. Provenance & Authority

authority: {
  initiatedBy: "human" | "system" | "ai";
  reviewedBy?: string;      // human reviewer id
  approvedAt?: string;     // ISO timestamp
}

Rules:

- AI-initiated migrations must be reviewable
- Human approval may be required for marketplace publication

## 11. Full Example (Readable + Parsable)

```json
{
  "reportId": "9f1a0d6e-3e2a-4b8e-b3e2-81fcb98a12b1",
  "createdAt": "2026-01-21T10:14:33Z",
  "input": {
    "legacyTemplateId": "tpl-landing-001",
    "source": "manual"
  },
  "decision": {
    "outcome": "rejected",
    "legacyOnly": true
  },
  "reasons": [
    {
      "code": "INTERACTIONS_PRESENT",
      "severity": "blocker"
    }
  ],
  "explanation": {
    "summary": "This template depends on interaction-driven animations.",
    "details": "CCM v1 only supports static, deterministic motion timelines."
  },
  "authority": {
    "initiatedBy": "human"
  }
}
```

## 12. Invariants This Report Protects

- Marketplace trust
- AI correctness
- Migration auditability
- User expectations
- Long-term maintainability

## 13. Hard Rule (Locked)

No legacy template may be converted, rejected, or deferred without an audit
report.

If there is no report, the migration did not happen.

## 14. Status

- ✅ Defined
- ✅ Human-readable
- ✅ Machine-readable
- ❌ Not implemented (by design)
