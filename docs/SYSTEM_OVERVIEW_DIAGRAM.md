# Dropple System Kernel Diagram

```
                          ┌─────────────────────────────────┐
                          │           PRODUCT LAYER         │
                          │                                 │
                          │  Marketplace • Gallery • Viewer │
                          │  Education • Certification      │
                          └───────────────▲─────────────────┘
                                          │
                                          │
                          ┌───────────────┴─────────────────┐
                          │             UI LAYER             │
                          │                                 │
                          │ Canvas • Panels • Toolbars      │
                          │ Selection • Overlays • Guides   │
                          │                                 │
                          │  UI emits INTENTS only          │
                          └───────────────▲─────────────────┘
                                          │
                                          │
                          ┌───────────────┴─────────────────┐
                          │        WORKSPACE LAYER           │
                          │                                 │
                          │ Design Workspace                │
                          │ Animation Workspace             │
                          │ Component Workspace             │
                          │                                 │
                          │ Tools • Panels • Capabilities   │
                          └───────────────▲─────────────────┘
                                          │
                                          │  INTENTS
                                          │
                          ┌───────────────┴─────────────────┐
                          │          RUNTIME KERNEL          │
                          │                                 │
                          │  Dispatcher                     │
                          │  Reducers                       │
                          │  Runtime State                  │
                          │                                 │
                          │  Interaction Sessions           │
                          │  MoveSession                    │
                          │  ResizeSession                  │
                          │  RotateSession                  │
                          │                                 │
                          │  Frame Pipeline                 │
                          └───────────────▲─────────────────┘
                                          │
                                          │
                        ┌─────────────────┴──────────────────┐
                        │         FRAME EXECUTION            │
                        │                                    │
                        │ Runtime State                      │
                        │        ↓                           │
                        │ Layout Pass                        │
                        │        ↓                           │
                        │ Spatial Index Build                │
                        │        ↓                           │
                        │ Guide Computation                  │
                        │        ↓                           │
                        │ Layout Inference                   │
                        │        ↓                           │
                        │ Preview Transforms                 │
                        │        ↓                           │
                        │ Renderer                           │
                        └─────────────────▲──────────────────┘
                                          │
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │               ENGINE LAYER                │
                    │                                           │
                    │  Geometry Engine                          │
                    │  Constraint Engine                        │
                    │  Alignment Engine                         │
                    │                                           │
                    │  Spatial Intelligence                     │
                    │  • Spatial Index                          │
                    │  • Spatial Query                          │
                    │                                           │
                    │  Guide Engine                             │
                    │  • Alignment Clusters                     │
                    │  • Distance Guides                        │
                    │  • Spacing Guides                         │
                    │  • Grid Patterns                          │
                    │  • Symmetry Axes                          │
                    │                                           │
                    │  Layout Engine                            │
                    │  • Layout Inference                       │
                    │  • Layout Conversion                      │
                    │                                           │
                    │  Timeline Engine                          │
                    │  • Track Evaluation                       │
                    │  • Channel Blending                       │
                    │  • Snapshot DAG                           │
                    │                                           │
                    │  (Pure deterministic computation)         │
                    └─────────────────────▲─────────────────────┘
                                          │
                                          │
                     ┌────────────────────┴────────────────────┐
                     │            CORE LAYER                   │
                     │                                        │
                     │  Contracts                              │
                     │  Event Types                            │
                     │  Reducer Definitions                    │
                     │  Constitutional Laws                    │
                     │                                        │
                     │  Determinism Guarantees                 │
                     └────────────────────▲────────────────────┘
                                          │
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │         INFRASTRUCTURE LAYER                │
                   │                                             │
                   │  Collaboration Transport                    │
                   │  Event Log Storage                          │
                   │  Network Sync                               │
                   │  Persistence                                │
                   │                                             │
                   │  (IO only — no runtime mutation)            │
                   └─────────────────────────────────────────────┘
```

## Dropple Dataflow (Simplified)

User Input  
↓  
UI Events  
↓  
Intent System  
↓  
Runtime Input Bridge  
↓  
Interaction Session  
↓  
Preview Transforms  
↓  
Frame Pipeline  
↓  
Engine Computation  
↓  
Renderer

## State Mutation Flow

Intent  
↓  
Dispatcher  
↓  
applyEvent()  
↓  
Reducers  
↓  
Runtime State

Only this path may mutate state.

## Deterministic Replay Flow

Event Log  
↓  
Dispatcher  
↓  
Reducers  
↓  
Runtime State  
↓  
State Hash Verification

Guarantee:

Same events  
= Same runtime state  
= Same export output

## Layout Intelligence Flow

Nodes  
↓  
Spatial Index  
↓  
Guide Engine  
↓  
Layout Inference  
↓  
Layout Suggestions  
↓  
Layout Conversion  
↓  
AutoLayout Container  
↓  
Layout Pass

## Why This Diagram Matters

This diagram shows Dropple is structured like a small operating system.

You now have:
- core laws
- runtime kernel
- deterministic engine
- UI shell
- product layer

This architecture gives Dropple:
- determinism
- replayability
- architectural stability
- scalability
