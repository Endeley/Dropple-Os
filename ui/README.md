UI Invariants (LOCKED):

- UI never dispatches runtime events directly.
- Canvas authoring flows through CanvasRoot -> useCanvasInteractions -> inputEngine -> toolHandlerRegistrationFacade.
- Session modules are non-canonical for canvas execution and must not compete with the canvas interaction pipeline.
- CanvasHost is the only pointer lifecycle owner.
- Ghosts and guides are preview-only.
- Runtime store is authoritative.
- Animated store is visual-only.
- There is exactly one dispatcher.
- Session managers may exist for preview or legacy flows, but canvas truth stays in the canonical dispatcher path.
