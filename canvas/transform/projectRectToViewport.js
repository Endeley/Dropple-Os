import { projectToViewport } from './projectToViewport.js';

export function projectRectToViewport(rect, viewport) {
    const topLeft = projectToViewport({ x: rect.x, y: rect.y }, viewport);
    const bottomRight = projectToViewport(
        { x: rect.x + rect.width, y: rect.y + rect.height },
        viewport,
    );

    return {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
    };
}
