'use client';

import RemoteCursors from './RemoteCursors.jsx';
import RemoteSelections from './RemoteSelections.jsx';

export default function CollabLayer() {
    return (
        <>
            <RemoteSelections />
            <RemoteCursors />
        </>
    );
}
