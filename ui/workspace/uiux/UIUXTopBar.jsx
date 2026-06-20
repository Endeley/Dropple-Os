'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function MenuButton({
    id,
    label,
    openMenuId,
    setOpenMenuId,
    items = [],
}) {
    const rootRef = useRef(null);
    const open = openMenuId === id;
    const visibleItems = useMemo(() => items.filter((item) => item && item.hidden !== true), [items]);

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            if (rootRef.current?.contains(event.target)) return;
            setOpenMenuId(null);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpenMenuId(null);
            }
        };

        window.addEventListener('pointerdown', handlePointerDown, true);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, setOpenMenuId]);

    return (
        <div ref={rootRef} className='uiux-topbar-menu'>
            <button
                type='button'
                aria-expanded={open}
                onClick={() => setOpenMenuId(open ? null : id)}>
                {label}
            </button>

            {open && visibleItems.length > 0 ? (
                <div className='uiux-topbar-menu__dropdown' role='menu'>
                    {visibleItems.map((item) => (
                        <button
                            key={item.id}
                            type='button'
                            role='menuitem'
                            disabled={item.disabled}
                            className={item.danger ? 'is-danger' : ''}
                            onClick={() => {
                                item.onClick?.();
                                setOpenMenuId(null);
                            }}>
                            {item.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function UIUXTopBar({
    onUndo = null,
    onRedo = null,
    onDelete = null,
    onGroup = null,
    onUngroup = null,
    onAttachMotion = null,
    onRemoveMotion = null,
    onReturnHome = null,
    onPublish = null,
    onActivateTool = null,
    createItems = [],
    canDelete = false,
    canGroup = false,
    canUngroup = false,
    canAttachMotion = false,
    canRemoveMotion = false,
}) {
    const [openMenuId, setOpenMenuId] = useState(null);

    const fileItems = useMemo(
        () => [
            {
                id: 'publish',
                label: 'Publish',
                disabled: typeof onPublish !== 'function',
                onClick: onPublish,
            },
        ],
        [onPublish],
    );

    const editItems = useMemo(
        () => [
            {
                id: 'undo',
                label: 'Undo',
                disabled: typeof onUndo !== 'function',
                onClick: onUndo,
            },
            {
                id: 'redo',
                label: 'Redo',
                disabled: typeof onRedo !== 'function',
                onClick: onRedo,
            },
            {
                id: 'delete',
                label: 'Delete Selected',
                disabled: !canDelete || typeof onDelete !== 'function',
                danger: true,
                onClick: onDelete,
            },
            {
                id: 'group',
                label: 'Group Selection',
                disabled: !canGroup || typeof onGroup !== 'function',
                onClick: onGroup,
            },
            {
                id: 'ungroup',
                label: 'Ungroup Selection',
                disabled: !canUngroup || typeof onUngroup !== 'function',
                onClick: onUngroup,
            },
            {
                id: 'attach-motion',
                label: 'Attach Motion',
                disabled: !canAttachMotion || typeof onAttachMotion !== 'function',
                onClick: onAttachMotion,
            },
            {
                id: 'remove-motion',
                label: 'Remove Motion',
                disabled: !canRemoveMotion || typeof onRemoveMotion !== 'function',
                onClick: onRemoveMotion,
            },
        ],
        [
            canAttachMotion,
            canDelete,
            canGroup,
            canRemoveMotion,
            canUngroup,
            onAttachMotion,
            onDelete,
            onGroup,
            onRedo,
            onRemoveMotion,
            onUndo,
            onUngroup,
        ],
    );

    const viewItems = useMemo(
        () => [
            {
                id: 'return-home',
                label: 'Return Home',
                disabled: typeof onReturnHome !== 'function',
                onClick: onReturnHome,
            },
        ],
        [onReturnHome],
    );

    const createMenuItems = useMemo(
        () =>
            (Array.isArray(createItems) ? createItems : [])
                .filter((item) => item && typeof item.toolId === 'string' && item.toolId.trim().length > 0)
                .map((item) => ({
                    id: `create-${item.toolId}`,
                    label: item.label || item.toolId,
                    disabled: typeof onActivateTool !== 'function',
                    onClick: () => onActivateTool?.(item.toolId),
                })),
        [createItems, onActivateTool],
    );

    return (
        <header className='uiux-topbar' data-testid='uiux-topbar' data-editor-unity='world-based'>
            <div className='uiux-topbar-group' data-testid='uiux-topbar-editor-group' aria-label='Editor controls'>
                <button type='button' onClick={onUndo} disabled={typeof onUndo !== 'function'}>
                    Undo
                </button>
                <button type='button' onClick={onRedo} disabled={typeof onRedo !== 'function'}>
                    Redo
                </button>
                <MenuButton id='file' label='File' openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} items={fileItems} />
                <MenuButton id='edit' label='Edit' openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} items={editItems} />
                <MenuButton id='view' label='View' openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} items={viewItems} />
            </div>

            <div className='uiux-topbar-group' data-testid='uiux-topbar-authoring-group' aria-label='Authoring controls'>
                <MenuButton
                    id='create'
                    label='Create'
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    items={createMenuItems}
                />
            </div>

            <div className='uiux-topbar-group' data-testid='uiux-topbar-project-group' aria-label='Project actions'>
                <button type='button' onClick={onPublish} disabled={typeof onPublish !== 'function'}>
                    Publish
                </button>
            </div>
        </header>
    );
}
