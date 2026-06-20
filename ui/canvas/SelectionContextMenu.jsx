'use client';

import { useEffect, useRef } from 'react';

export default function SelectionContextMenu({
    open = false,
    x = 0,
    y = 0,
    canGroup = false,
    canUngroup = false,
    canAttachMotion = false,
    canRemoveMotion = false,
    onDelete,
    onGroup,
    onUngroup,
    onAttachMotion,
    onRemoveMotion,
    onClose,
}) {
    const rootRef = useRef(null);

    const stopEvent = (event) => {
        event.stopPropagation();
    };

    const consumeEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const runAction = async (event, action) => {
        consumeEvent(event);
        await action?.();
        onClose?.('action.run');
    };

    useEffect(() => {
        if (!open) return undefined;

        const handlePointerDown = (event) => {
            const inside = rootRef.current?.contains(event.target) ?? false;
            if (inside) return;
            onClose?.('window.pointerdown');
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.('escape');
            }
        };

        const handleBlur = () => {
            onClose?.('window.blur');
        };

        window.addEventListener('pointerdown', handlePointerDown, true);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown, true);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
        };
    }, [onClose, open]);

    if (!open) return null;

    return (
        <div
            ref={rootRef}
            className='selection-context-menu'
            data-testid='selection-context-menu'
            onPointerDown={(event) => {
                stopEvent(event);
            }}
            onMouseDown={(event) => {
                stopEvent(event);
            }}
            onClick={(event) => {
                consumeEvent(event);
            }}
            onContextMenu={(event) => {
                consumeEvent(event);
            }}
            style={{
                left: x,
                top: y,
            }}>
            <button
                type='button'
                className='selection-context-menu__button is-danger'
                data-testid='selection-context-delete'
                onPointerDown={stopEvent}
                onMouseDown={stopEvent}
                onClick={(event) => {
                    void runAction(event, onDelete);
                }}>
                Delete
            </button>

            {canGroup ? (
                <button
                    type='button'
                    className='selection-context-menu__button'
                    data-testid='selection-context-group'
                    onPointerDown={stopEvent}
                    onMouseDown={stopEvent}
                    onClick={(event) => {
                        void runAction(event, onGroup);
                    }}>
                    Group
                </button>
            ) : null}

            {canUngroup ? (
                <button
                    type='button'
                    className='selection-context-menu__button'
                    data-testid='selection-context-ungroup'
                    onPointerDown={stopEvent}
                    onMouseDown={stopEvent}
                    onClick={(event) => {
                        void runAction(event, onUngroup);
                    }}>
                    Ungroup
                </button>
            ) : null}

            {canAttachMotion ? (
                <button
                    type='button'
                    className='selection-context-menu__button'
                    data-testid='selection-context-attach-motion'
                    onPointerDown={stopEvent}
                    onMouseDown={stopEvent}
                    onClick={(event) => {
                        void runAction(event, onAttachMotion);
                    }}>
                    Attach Motion
                </button>
            ) : null}

            {canRemoveMotion ? (
                <button
                    type='button'
                    className='selection-context-menu__button'
                    data-testid='selection-context-remove-motion'
                    onPointerDown={stopEvent}
                    onMouseDown={stopEvent}
                    onClick={(event) => {
                        void runAction(event, onRemoveMotion);
                    }}>
                    Remove Motion
                </button>
            ) : null}
        </div>
    );
}
