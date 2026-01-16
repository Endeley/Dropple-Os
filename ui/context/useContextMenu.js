'use client';

import { useEffect, useState } from 'react';

export function useContextMenu() {
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        function onGlobalClick() {
            setMenu(null);
        }
        function onEsc(e) {
            if (e.key === 'Escape') setMenu(null);
        }

        window.addEventListener('pointerdown', onGlobalClick);
        window.addEventListener('keydown', onEsc);
        return () => {
            window.removeEventListener('pointerdown', onGlobalClick);
            window.removeEventListener('keydown', onEsc);
        };
    }, []);

    return {
        menu,
        openMenu: setMenu,
        closeMenu: () => setMenu(null),
    };
}
