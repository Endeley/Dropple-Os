'use client';

import { useEffect } from 'react';
import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

/**
 * Token -> CSS Projection Bridge
 *
 * Reads canonical runtime tokens and projects them into CSS variables.
 * This replaces manual token definitions in styles/tokens.css over time.
 */
export function TokenCssBridge() {
    const tokens = useRuntimeStore((state) => state.tokens);

    useEffect(() => {
        if (!tokens || typeof document === 'undefined') return;

        const root = document.documentElement;

        applyColorTokens(root, tokens.color);
        applySpaceTokens(root, tokens.space);
        applyRadiusTokens(root, tokens.radius);
        applyMotionTokens(root, tokens.motion);
    }, [tokens]);

    return null;
}

function applyColorTokens(root, color = {}) {
    if (!color) return;

    setCssVar(root, '--color-primary', color.primary);
    setCssVar(root, '--color-secondary', color.secondary);

    setCssVar(root, '--text-primary', color.text);
    setCssVar(root, '--text-muted', color.textMuted);

    setCssVar(root, '--border-default', color.border);
    setCssVar(root, '--border-strong', color.borderStrong);

    setCssVar(root, '--surface-0', color.bg);
    setCssVar(root, '--surface-1', color.panelBg);
}

function applySpaceTokens(root, space = {}) {
    if (!space) return;

    Object.entries(space).forEach(([key, value]) => {
        setCssVar(root, `--space-${key}`, `${value}px`);
    });
}

function applyRadiusTokens(root, radius = {}) {
    if (!radius) return;

    Object.entries(radius).forEach(([key, value]) => {
        setCssVar(root, `--radius-${key}`, `${value}px`);
    });
}

function applyMotionTokens(root, motion = {}) {
    if (!motion) return;

    Object.entries(motion).forEach(([key, value]) => {
        setCssVar(root, `--motion-${key}`, value);
    });
}

function setCssVar(root, name, value) {
    if (value === undefined || value === null) return;
    root.style.setProperty(name, value);
}
