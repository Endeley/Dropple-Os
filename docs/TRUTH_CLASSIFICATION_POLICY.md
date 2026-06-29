# Truth Classification Policy

## Purpose

This document defines how Dropple responds to failing tests, regressions, and unexpected behavior.

Its purpose is not to make tests pass.

Its purpose is to determine which truth has changed before any implementation or test is modified.

This policy protects the alignment between:

* Architecture
* Product Contracts
* Implementation
* Tests

A failing test always indicates that one of these truths has drifted.

The first responsibility is to identify which one.

---

# Governing Rule

Before changing code or tests, classify the failure.

There are only three valid classifications.

---

# Truth A — Implementation Truth

The implementation no longer satisfies an established product contract.

Examples include:

* runtime failures
* build failures
* replay regressions
* pointer-event bugs
* selection regressions
* performance regressions
* dispatcher failures

### Action

* Fix the implementation.
* Preserve the existing product contract.
* Preserve the existing tests unless the tests themselves are incorrect.

---

# Truth B — Product Contract Truth

The product behavior has intentionally changed through a reviewed and accepted milestone.

The implementation reflects the new product contract.

The tests still enforce the previous contract.

Examples include:

* first artifact becomes automatically selected
* semantic projection appears immediately after creation
* a reviewed interaction flow intentionally changes

### Action

* Preserve the implementation.
* Update the tests to match the reviewed product contract.
* The updated tests become the new constitutional contract.

---

# Truth C — Undecided Truth

The intended behavior has never been explicitly frozen.

The failure exposes an ownership question rather than a regression.

Examples include:

* competing UX expectations
* unclear ownership
* ambiguous interaction behavior
* accidental behavior introduced during unrelated work

### Action

* Stop.
* Audit.
* Freeze the intended behavior.
* Only then modify either implementation or tests.

---

# Decision Flow

Every failure should follow this sequence:

```text
Failure
      ↓
Truth Classification
      ↓
Truth A
      → Fix implementation

Truth B
      → Update product contract tests

Truth C
      → Audit first
```

No other corrective path is permitted.

---

# Relationship to Product Development

Tests are constitutional contracts.

They are neither untouchable dogma nor disposable snapshots.

Their purpose is to preserve reviewed product behavior.

When product behavior intentionally changes, the contract changes.

When implementation regresses, the implementation changes.

When intent is unclear, neither changes until the behavior is reviewed.

---

# Recent Examples

## Truth A

Engineering Stabilization

* e2e build path normalization
* Playwright dist-directory correction
* Empty World pointer-event interception

The implementation was incorrect.

The product contract remained unchanged.

---

## Truth B

Create/UI Expression Milestone 2A

Reviewed behavior:

```text
Empty World
      ↓
Create Page
      ↓
Automatically Select Page
      ↓
Reveal Semantic Projection
```

The implementation reflected the reviewed product.

Older tests reflected the previous contract.

Updating the tests was therefore correct.

---

## Truth C

Any interaction or ownership behavior that has not yet been reviewed or frozen.

These require architectural or product review before implementation or tests are modified.

---

# Constitutional Principle

Dropple does not ask:

> "How do we make the tests pass?"

Dropple asks:

> "Which truth has changed?"

Only after that question is answered should implementation or tests be modified.

---

# Conclusion

Truth Classification protects the constitutional relationship between:

* Architecture
* Product Contracts
* Implementation
* Tests

Every future regression, failing test, or unexpected behavior should begin with Truth Classification before any corrective action is taken.
