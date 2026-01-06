# How to Add a New Tool Safely

Example: Rotate Tool

## Step 1 — Define the Event

```
NODE_ROTATE { id, angle }
```

## Step 2 — Reducer (Pure)

No side effects. No DOM. No stores.

## Step 3 — Input Session

- Track intent only
- Emit event on commit

## Step 4 — Dispatcher

- Guards
- History
- Optional animation

## Step 5 — Preview (Optional)

Visual only. No mutation.

## Step 6 — Export

- Update CSS / WAAPI exporters
- Ensure deterministic output
- Verify export diff

## Step 7 — Permissions

- Viewer blocked
- Server enforced

If any step is skipped, the tool is invalid.
