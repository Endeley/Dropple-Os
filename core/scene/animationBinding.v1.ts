import {
    selectActiveScene,
    selectActiveShot,
    selectCompositionForShot,
} from './selectors.v1';
import type { ProjectV2 } from '../contracts/project.v2';

export function resolveAnimationComposition(project: ProjectV2 | null | undefined) {
    const scene = selectActiveScene(project);
    if (!scene) return null;

    const shot = selectActiveShot(project);
    if (!shot) return null;

    const composition = selectCompositionForShot(project, shot);
    if (!composition) return null;

    return composition;
}
