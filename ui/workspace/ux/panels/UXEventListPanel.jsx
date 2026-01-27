'use client';

/**
 * UXEventListPanel
 *
 * Read-only event timeline for UX Mode.
 * MUST NOT:
 * - emit events
 * - mutate state
 * - subscribe to interaction hooks
 */

import { useMemo } from 'react';
import { getEventsUpToCursor } from '@/runtime/events/getEventsUpToCursor';

export function UXEventListPanel({ events = [], cursorIndex = -1 }) {
    const visibleEvents = useMemo(() => {
        if (!Array.isArray(events)) return [];
        if (cursorIndex < 0) return events;
        return getEventsUpToCursor(events, cursorIndex);
    }, [events, cursorIndex]);

    return (
        <section style={{ padding: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Event History
            </h3>

            {visibleEvents.length === 0 ? (
                <div style={{ fontSize: 12, opacity: 0.6 }}>No events yet</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {visibleEvents.map((evt, index) => (
                        <li
                            key={evt.id ?? index}
                            style={{
                                fontSize: 12,
                                padding: '6px 0',
                                borderBottom: '1px solid #eee',
                            }}>
                            <div style={{ fontWeight: 500 }}>
                                {evt.type ?? 'unknown'}
                            </div>
                            <div style={{ opacity: 0.6 }}>index {index}</div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
