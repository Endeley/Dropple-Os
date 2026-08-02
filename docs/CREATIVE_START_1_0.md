# Creative Start 1.0

Status: Active product milestone  
Date: 2026-07-30  
Scope: Creator-facing session resolution before workspace launch  
Authority: Product milestone artifact, subordinate to `CREATIVE_SESSION_RESOLUTION_ROADMAP.md`, `LAUNCH_PRODUCER_CONTRACT.md`, and `WORKSPACE_LAUNCH_CONTEXT_SPEC.md`

## Purpose

Creative Start 1.0 is the first creator-facing milestone after launch
convergence.

Its job is not to create a new runtime.

Its job is to make the beginning of creation coherent.

Creative Start owns creator intent.

Launch Producers own launch truth.

Workspace consumes launch truth.

## Resolution States

Creative Start must be defined as state resolution, not screen count.

The canonical resolution sequence is:

Language  
↓  
Blueprint Category  
↓  
Blueprint  
↓  
Template  
↓  
Workspace Launch Context Resolved  
↓  
Workspace

UI presentation may vary.

The state sequence may not.

## First Implementation Slice

The first implementation slice is:

Marketplace Resolution Surface

This slice reuses the existing Marketplace surface as the first product-facing
Creative Start environment.

It does not introduce:

- a second canvas
- a second runtime
- a separate creative-start application
- a new launch authority path

## Scope

The first slice must make three creator decisions explicit before launch:

1. Language family
2. Blueprint category
3. Blueprint choice

Template detail and workspace launch may remain on the existing downstream path
for this slice.

## Current Constraint

The current certified template catalog is not yet fully aligned to the
fine-grained homepage language taxonomy.

Therefore the first slice should resolve creators through the canonical
workspace families already present in the catalog when required.

This is an implementation constraint, not a product truth change.

## Requirements

Creative Start 1.0 first slice must:

- expose language or workspace-family selection as an explicit resolution state
- expose blueprint category as an explicit resolution state
- narrow visible blueprint choices based on those decisions
- preserve canonical template and blueprint launch producers
- avoid reopening `WorkspaceRoot`, `WorkspaceSession`, or runtime boot

## Non-Goals

The first slice does not require:

- full template-author flow
- blueprint-author flow
- homepage producer replacement
- recent-work producer changes
- marketplace certification redesign
- runtime boot refactor

## Completion Signal

The first Creative Start slice is successful when a creator can enter the
Marketplace surface and clearly understand:

- what creative family they are beginning in
- what blueprint category they are narrowing toward
- what starting artifacts belong to that path

before any workspace launch occurs.
