# Dropple Architecture Laws

## 1. UI Boundary
UI modules may:
- emit input
- render projections

UI modules may NOT:
- import runtime implementation
- mutate runtime state
- compute interaction logic

## 2. Dispatcher Authority
All mutations must go through dispatcher.

Forbidden:
- direct state mutation
- reducer bypass

## 3. Runtime Ownership
Runtime owns:
- interaction math
- drag
- snap
- magnetic
- constraints

## 4. Engine Purity
Engines must be pure functions:

`(input, state) -> output`

Forbidden:
- DOM access
- React hooks
- randomness
- time-based logic

## 5. Tool System Contract
Tools must:
- register through capability lifecycle
- use dispatcher events

Forbidden:
- custom workspace logic paths
- direct mutation

## 6. Event-Driven Truth
All interaction effects must resolve to events:
- `node.layout.move`
- `node.layout.resize`
- `node.layout.rotate`

## 7. Single Interaction Pipeline
All interaction flows through:

`Input -> Tool -> Drag -> Resolve -> Magnetic -> Reducer -> Projection -> UI`
