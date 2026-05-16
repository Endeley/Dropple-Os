import { normalizeSchedulePartitionIds } from '@/runtime/scheduler/scheduleIdentity.js';

function toFiniteNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizeBlendMode(value) {
    return value === 'add' || value === 'replace' ? value : 'replace';
}

function normalizeSimulationEntity(previousEntity, inputEntity) {
    const id = String(inputEntity.id);
    const x = toFiniteNumber(previousEntity?.x, toFiniteNumber(inputEntity.targetX, 0));
    const y = toFiniteNumber(previousEntity?.y, toFiniteNumber(inputEntity.targetY, 0));
    const vx = toFiniteNumber(previousEntity?.vx, 0);
    const vy = toFiniteNumber(previousEntity?.vy, 0);

    return { id, x, y, vx, vy };
}

function evaluateSpringStep(entity, inputEntity, deltaSeconds, spring, damping, chainForce = null) {
    const targetX = toFiniteNumber(inputEntity.targetX, 0);
    const targetY = toFiniteNumber(inputEntity.targetY, 0);

    const chainAx = toFiniteNumber(chainForce?.ax, 0);
    const chainAy = toFiniteNumber(chainForce?.ay, 0);

    const ax = (targetX - entity.x) * spring - entity.vx * damping + chainAx;
    const ay = (targetY - entity.y) * spring - entity.vy * damping + chainAy;

    const vx = entity.vx + ax * deltaSeconds;
    const vy = entity.vy + ay * deltaSeconds;
    const x = entity.x + vx * deltaSeconds;
    const y = entity.y + vy * deltaSeconds;

    const next = Object.freeze({
        id: entity.id,
        x,
        y,
        vx,
        vy,
        targetX,
        targetY,
    });
    const trace = Object.freeze({
        type: 'entity.spring-step',
        entityId: entity.id,
        spring: toFiniteNumber(spring, 0),
        damping: toFiniteNumber(damping, 0),
        chainAx,
        chainAy,
        x,
        y,
        vx,
        vy,
    });

    return { next, trace };
}

function buildChainForceMap({ chains, entities, targetsById }) {
    const forceMap = {};
    const trace = [];

    for (const chain of chains) {
        const members = chain?.members ?? [];
        for (let index = 1; index < members.length; index += 1) {
            const memberId = members[index];
            const parentId = members[index - 1];
            const member = entities[memberId];
            const parent = entities[parentId];
            if (!member || !parent) continue;

            const memberTarget = targetsById[memberId] ?? { targetX: 0, targetY: 0 };
            const parentTarget = targetsById[parentId] ?? { targetX: 0, targetY: 0 };
            const restX = toFiniteNumber(memberTarget.targetX, 0) - toFiniteNumber(parentTarget.targetX, 0);
            const restY = toFiniteNumber(memberTarget.targetY, 0) - toFiniteNumber(parentTarget.targetY, 0);

            const dx = parent.x + restX - member.x;
            const dy = parent.y + restY - member.y;
            const dvx = member.vx - parent.vx;
            const dvy = member.vy - parent.vy;

            const ax = dx * toFiniteNumber(chain?.stiffness, 1) - dvx * toFiniteNumber(chain?.damping, 1);
            const ay = dy * toFiniteNumber(chain?.stiffness, 1) - dvy * toFiniteNumber(chain?.damping, 1);

            const previous = forceMap[memberId] ?? { ax: 0, ay: 0 };
            forceMap[memberId] = {
                ax: previous.ax + ax,
                ay: previous.ay + ay,
            };
            trace.push(
                Object.freeze({
                    type: 'constraint.spring-chain-force',
                    chainId: String(chain?.id ?? ''),
                    memberId: String(memberId),
                    parentId: String(parentId),
                    ax: toFiniteNumber(ax, 0),
                    ay: toFiniteNumber(ay, 0),
                    blendMode: normalizeBlendMode(chain?.blendMode),
                }),
            );
        }
    }

    return {
        forceMap,
        trace: Object.freeze(
            trace.sort((left, right) => {
                const byChain = left.chainId.localeCompare(right.chainId);
                if (byChain !== 0) return byChain;
                const byParent = left.parentId.localeCompare(right.parentId);
                if (byParent !== 0) return byParent;
                return left.memberId.localeCompare(right.memberId);
            }),
        ),
    };
}

function blendForceMaps(baseMap, nextMap, blendMode = 'replace') {
    const mode = normalizeBlendMode(blendMode);
    const result = { ...baseMap };
    const entries = Object.entries(nextMap).sort(([left], [right]) => left.localeCompare(right));

    for (const [entityId, force] of entries) {
        if (mode === 'add') {
            const previous = result[entityId] ?? { ax: 0, ay: 0 };
            result[entityId] = {
                ax: toFiniteNumber(previous.ax, 0) + toFiniteNumber(force?.ax, 0),
                ay: toFiniteNumber(previous.ay, 0) + toFiniteNumber(force?.ay, 0),
            };
            continue;
        }

        result[entityId] = {
            ax: toFiniteNumber(force?.ax, 0),
            ay: toFiniteNumber(force?.ay, 0),
        };
    }

    return result;
}

function buildGroupedChainForceMap({ chainsById, groups, entities, targetsById }) {
    let forceMap = {};
    const trace = [];

    for (const group of groups) {
        let groupForce = {};
        for (const chainId of group.chainIds ?? []) {
            const chain = chainsById[chainId];
            if (!chain) continue;
            const chainEvaluation = buildChainForceMap({
                chains: [chain],
                entities,
                targetsById,
            });
            groupForce = blendForceMaps(groupForce, chainEvaluation.forceMap, chain.blendMode);
            trace.push(...chainEvaluation.trace);
            trace.push(
                Object.freeze({
                    type: 'constraint.spring-chain-apply',
                    groupId: String(group?.id ?? ''),
                    chainId: String(chainId),
                    chainBlendMode: normalizeBlendMode(chain?.blendMode),
                    groupBlendMode: normalizeBlendMode(group?.blendMode),
                }),
            );
        }
        forceMap = blendForceMaps(forceMap, groupForce, group.blendMode);
    }

    return {
        forceMap,
        trace: Object.freeze(
            trace.sort((left, right) => {
                const byType = left.type.localeCompare(right.type);
                if (byType !== 0) return byType;
                const leftGroup = String(left.groupId ?? '');
                const rightGroup = String(right.groupId ?? '');
                const byGroup = leftGroup.localeCompare(rightGroup);
                if (byGroup !== 0) return byGroup;
                const leftChain = String(left.chainId ?? '');
                const rightChain = String(right.chainId ?? '');
                return leftChain.localeCompare(rightChain);
            }),
        ),
    };
}

export function simulationTick({
    simulationInputs,
    previousSimulationState = null,
    simulationPartitionSchedule = null,
    spring = 24,
    damping = 9,
} = {}) {
    const inputs = simulationInputs ?? { entities: [], time: 0, deltaTime: 0 };
    const deltaSeconds = Math.max(0, toFiniteNumber(inputs.deltaTime, 0)) / 1000;
    const previousEntities = previousSimulationState?.entities ?? {};
    const previousPartitionExecution = previousSimulationState?.partitionExecution ?? null;
    const dampingProfiles = inputs?.dampingProfiles ?? {};
    const entityProfiles = inputs?.entityProfiles ?? {};
    const springChains = [...(inputs?.springChains ?? [])].sort((left, right) =>
        String(left?.id).localeCompare(String(right?.id))
    );
    const springChainGroups = [...(inputs?.springChainGroups ?? [])].sort((left, right) => {
        const byPriority = toFiniteNumber(left?.priority, 0) - toFiniteNumber(right?.priority, 0);
        return byPriority !== 0 ? byPriority : String(left?.id).localeCompare(String(right?.id));
    });
    const orderedInputEntities = [...(inputs.entities ?? [])]
        .filter((entity) => entity && typeof entity.id !== 'undefined')
        .sort((left, right) => String(left.id).localeCompare(String(right.id)));

    const normalizedEntities = {};
    const targetsById = {};
    for (const inputEntity of orderedInputEntities) {
        normalizedEntities[inputEntity.id] = normalizeSimulationEntity(
            previousEntities[inputEntity.id],
            inputEntity
        );
        targetsById[inputEntity.id] = {
            targetX: toFiniteNumber(inputEntity.targetX, 0),
            targetY: toFiniteNumber(inputEntity.targetY, 0),
        };
    }

    const chainsById = Object.fromEntries(springChains.map((chain) => [chain.id, chain]));
    const hasGroups = springChainGroups.length > 0;
    const sameScheduleSignature =
        String(previousPartitionExecution?.scheduleSignature ?? '') ===
        String(simulationPartitionSchedule?.scheduleSignature ?? '');
    const baselineEntities = sameScheduleSignature && previousPartitionExecution?.baselineEntities
        ? Object.fromEntries(
              Object.entries(previousPartitionExecution.baselineEntities).map(([entityId, entity]) => [
                  entityId,
                  {
                      id: String(entity?.id ?? entityId),
                      x: toFiniteNumber(entity?.x, 0),
                      y: toFiniteNumber(entity?.y, 0),
                      vx: toFiniteNumber(entity?.vx, 0),
                      vy: toFiniteNumber(entity?.vy, 0),
                  },
              ]),
          )
        : normalizedEntities;
    const chainEvaluation = hasGroups
        ? buildGroupedChainForceMap({
              chainsById,
              groups: springChainGroups,
              entities: baselineEntities,
              targetsById,
          })
        : buildChainForceMap({
              chains: springChains,
              entities: baselineEntities,
              targetsById,
          });
    const chainForceMap = chainEvaluation.forceMap;
    const currentPrimitiveTrace = [...(chainEvaluation.trace ?? [])];
    const allPartitionIds = normalizeSchedulePartitionIds(
        Object.values(inputs?.entityPartitionIds ?? { '__global__': '__global__' }),
    );
    const orderedPartitionIds = normalizeSchedulePartitionIds(
        simulationPartitionSchedule?.orderedPartitionIds?.length
            ? simulationPartitionSchedule.orderedPartitionIds
            : allPartitionIds,
    );
    const partitionCursor = Math.max(0, Math.floor(toFiniteNumber(simulationPartitionSchedule?.partitionCursor, 0)));
    const partitionBudget = Math.max(
        0,
        Math.floor(
            toFiniteNumber(
                simulationPartitionSchedule?.partitionBudget,
                orderedPartitionIds.length - partitionCursor,
            ),
        ),
    );
    const activePartitionIds = orderedPartitionIds.slice(
        partitionCursor,
        partitionCursor + partitionBudget,
    );
    const activePartitionSet = new Set(activePartitionIds);
    const completedPartitionSet = new Set(orderedPartitionIds.slice(0, partitionCursor));

    for (const partitionId of activePartitionIds) {
        currentPrimitiveTrace.push(
            Object.freeze({
                type: 'partition.start',
                partitionId: String(partitionId),
                scheduleSignature: String(simulationPartitionSchedule?.scheduleSignature ?? ''),
            }),
        );
    }

    const nextEntities = {};
    for (const inputEntity of orderedInputEntities) {
        const baselineEntity = baselineEntities[inputEntity.id];
        const entityPartitionId = String(inputs?.entityPartitionIds?.[inputEntity.id] ?? '__global__');
        if (activePartitionIds.length > 0 && !activePartitionSet.has(entityPartitionId)) {
            if (completedPartitionSet.has(entityPartitionId) && previousEntities[inputEntity.id]) {
                const preserved = previousEntities[inputEntity.id];
                nextEntities[inputEntity.id] = Object.freeze({
                    id: String(preserved?.id ?? inputEntity.id),
                    x: toFiniteNumber(preserved?.x, toFiniteNumber(inputEntity.targetX, 0)),
                    y: toFiniteNumber(preserved?.y, toFiniteNumber(inputEntity.targetY, 0)),
                    vx: toFiniteNumber(preserved?.vx, 0),
                    vy: toFiniteNumber(preserved?.vy, 0),
                    targetX: toFiniteNumber(inputEntity.targetX, 0),
                    targetY: toFiniteNumber(inputEntity.targetY, 0),
                });
                continue;
            }
            nextEntities[inputEntity.id] = Object.freeze({
                id: baselineEntity.id,
                x: baselineEntity.x,
                y: baselineEntity.y,
                vx: baselineEntity.vx,
                vy: baselineEntity.vy,
                targetX: toFiniteNumber(inputEntity.targetX, 0),
                targetY: toFiniteNumber(inputEntity.targetY, 0),
            });
            continue;
        }
        const profileId = entityProfiles[inputEntity.id] ?? null;
        const profile = (profileId && dampingProfiles[profileId]) || null;
        const springMultiplier = Math.max(0, toFiniteNumber(profile?.springMultiplier, 1));
        const dampingMultiplier = Math.max(0, toFiniteNumber(profile?.dampingMultiplier, 1));
        const step = evaluateSpringStep(
            baselineEntity,
            inputEntity,
            deltaSeconds,
            toFiniteNumber(spring, 24) * springMultiplier,
            toFiniteNumber(damping, 9) * dampingMultiplier,
            chainForceMap[inputEntity.id] ?? null,
        );
        nextEntities[inputEntity.id] = step.next;
        currentPrimitiveTrace.push(step.trace);
    }

    for (const partitionId of activePartitionIds) {
        currentPrimitiveTrace.push(
            Object.freeze({
                type: 'partition.complete',
                partitionId: String(partitionId),
                scheduleSignature: String(simulationPartitionSchedule?.scheduleSignature ?? ''),
            }),
        );
    }

    const carriedPrimitiveTrace = sameScheduleSignature
        ? [...(previousPartitionExecution?.accumulatedPrimitiveTrace ?? [])]
        : [];
    const primitiveTrace = [...carriedPrimitiveTrace, ...currentPrimitiveTrace];

    return Object.freeze({
        tickTime: toFiniteNumber(inputs.time, 0),
        deltaTime: Math.max(0, toFiniteNumber(inputs.deltaTime, 0)),
        entities: Object.freeze(nextEntities),
        partitionExecution: Object.freeze({
            scheduleSignature: String(simulationPartitionSchedule?.scheduleSignature ?? ''),
            orderedPartitionIds: Object.freeze(orderedPartitionIds),
            partitionCursor,
            completedPartitionIds: Object.freeze(orderedPartitionIds.slice(0, partitionCursor + activePartitionIds.length)),
            remainingPartitionIds: Object.freeze(orderedPartitionIds.slice(partitionCursor + activePartitionIds.length)),
            baselineEntities: Object.freeze(
                Object.fromEntries(
                    Object.entries(baselineEntities).map(([entityId, entity]) => [
                        entityId,
                        Object.freeze({
                            id: String(entity?.id ?? entityId),
                            x: toFiniteNumber(entity?.x, 0),
                            y: toFiniteNumber(entity?.y, 0),
                            vx: toFiniteNumber(entity?.vx, 0),
                            vy: toFiniteNumber(entity?.vy, 0),
                        }),
                    ]),
                ),
            ),
            accumulatedPrimitiveTrace: Object.freeze(
                primitiveTrace.map((entry) => Object.freeze({ ...entry })),
            ),
        }),
        primitiveTrace: Object.freeze(
            primitiveTrace.sort((left, right) => {
                const byType = String(left?.type ?? '').localeCompare(String(right?.type ?? ''));
                if (byType !== 0) return byType;
                const leftEntity = String(left?.entityId ?? '');
                const rightEntity = String(right?.entityId ?? '');
                if (leftEntity !== rightEntity) return leftEntity.localeCompare(rightEntity);
                const leftChain = String(left?.chainId ?? '');
                const rightChain = String(right?.chainId ?? '');
                if (leftChain !== rightChain) return leftChain.localeCompare(rightChain);
                const leftMember = String(left?.memberId ?? '');
                const rightMember = String(right?.memberId ?? '');
                if (leftMember !== rightMember) return leftMember.localeCompare(rightMember);
                return String(left?.groupId ?? '').localeCompare(String(right?.groupId ?? ''));
            }),
        ),
    });
}
