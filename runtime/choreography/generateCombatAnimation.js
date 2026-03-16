import { COMBAT_TEMPLATES } from './combatTemplates.js';

export function generateCombatAnimation(beat, { participants = {} } = {}) {
    const attackTemplate = COMBAT_TEMPLATES[beat?.action] ?? null;
    const reactionTemplate = COMBAT_TEMPLATES[beat?.reaction] ?? null;
    const clips = [];

    if (attackTemplate) {
        clips.push({
            id: `${beat?.id ?? 'beat'}:attack`,
            sourceBeatId: beat?.id ?? null,
            role: 'attack',
            rigId: participants[beat?.attacker]?.rigId ?? beat?.attacker ?? null,
            participantId: beat?.attacker ?? null,
            startFrame: Number(beat?.time ?? 0) - Number(attackTemplate.duration ?? 0),
            duration: Number(attackTemplate.duration ?? 0),
            mode: 'replace',
            weight: 1,
            channels: attackTemplate.channels,
        });
    }

    if (reactionTemplate) {
        clips.push({
            id: `${beat?.id ?? 'beat'}:reaction`,
            sourceBeatId: beat?.id ?? null,
            role: 'reaction',
            rigId: participants[beat?.target]?.rigId ?? beat?.target ?? null,
            participantId: beat?.target ?? null,
            startFrame: Number(beat?.time ?? 0),
            duration: Number(reactionTemplate.duration ?? 0),
            mode: 'replace',
            weight: 1,
            channels: reactionTemplate.channels,
        });
    }

    return clips;
}

