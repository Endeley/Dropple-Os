# Failure Modes & Recovery

Dropple OS is designed to **fail safely**.

## UI Crash

```
Component error
→ GlobalErrorBoundary
→ User recovery UI
```

State is preserved.

## Canvas Crash

```
Renderer error
→ EditorErrorBoundary
→ resetRuntimeState()
```

Only the editor resets.

## Reducer / Event Error

```
dispatch(event)
→ error
→ rollback
```

No partial state commits.

## Persistence Failure

```
runtimeError === true
→ autosave skipped
```

Broken state is never saved.

## Collaboration Permission Failure

```
remote event
→ server permission check
→ reject
```

Reducers never see invalid data.
