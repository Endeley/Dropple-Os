UI Invariants (LOCKED):

- UI never dispatches runtime events directly.
- All mutations flow through InputSessionManager.
- CanvasHost is the only pointer lifecycle owner.
- Ghosts and guides are preview-only.
- Runtime store is authoritative.
- Animated store is visual-only.
- There is exactly one dispatcher.
- There is exactly one session manager.
