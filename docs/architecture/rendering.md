# Rendering Architecture

## Canonical Rendering Pipeline

Runtime (CCM truth)  
-> NodeLayer  
-> NodeRenderer  
-> NodeView

## NodeView Contract (LOCKED)

- Receives projected rect only
- Performs zero math
- No fallbacks
- No NaN guards
- No viewport logic

If NodeView needs math, projection is broken upstream.

## Projection Responsibility

All projection math lives in NodeRenderer.

Forbidden:

- projection in NodeView
- scale in NodeView
- zoom logic in NodeView
