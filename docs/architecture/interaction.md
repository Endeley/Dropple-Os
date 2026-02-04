# Interaction Architecture

## Pointer Ownership

CanvasHost is the sole pointer lifecycle owner.

## Drag & Resize Flow

NodeView  
-> intent.node.pointerDown  
-> nodeDragResolver  
-> InputSessionManager  
-> intent.edit.commit  
-> dispatcher.dispatch

NodeView never mutates state.

## Session Rules

- One active session at a time
- Sessions emit intent, not truth
