'use client';

import CanvasSnapGuides from './CanvasSnapGuides.jsx';
import InsertionLine from './InsertionLine.jsx';

export default function GuideLayer() {
    return (
        <>
            <CanvasSnapGuides />
            <InsertionLine />
        </>
    );
}
