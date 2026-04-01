import type {
  ProjectExecutionData,
  SequenceMobilizationProjection,
  SequenceProjection,
  SequenceStepProjection,
  TradeScope,
  Mobilization,
} from '@/types/database'

// Source-of-truth rule:
// - project/gate/projectTrade/mobilization/tradeScope records are canonical facts
// - runtime steps and timeline layout are derived here
// - compatibility step JSON on raw mobilizations is intentionally ignored by this projector

function compareMobilizations(a: Mobilization, b: Mobilization) {
  if (a.startOffset !== b.startOffset) return a.startOffset - b.startOffset
  if (a.duration !== b.duration) return a.duration - b.duration
  return a.id.localeCompare(b.id)
}

function compareScopes(a: TradeScope, b: TradeScope) {
  if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  }
  return a.name.localeCompare(b.name)
}

function getScopeDuration(scope: TradeScope) {
  const duration = Number(scope.duration ?? 1)
  return Number.isFinite(duration) && duration > 0 ? duration : 1
}

function buildProjectedSteps(
  mobilization: Mobilization,
  scopes: TradeScope[],
  startOffset: number,
): SequenceStepProjection[] {
  let currentDay = startOffset
  return scopes.map((scope, index) => {
    const duration = getScopeDuration(scope)
    const step = {
      id: scope.id || `${mobilization.id}-scope-step-${index + 1}`,
      mobilizationId: mobilization.id,
      name: scope.name,
      notes: scope.notes,
      sortOrder: scope.sortOrder ?? index + 1,
      duration,
      startDay: currentDay,
      endDay: currentDay + duration,
      sourceScopeId: scope.id,
    } satisfies SequenceStepProjection

    currentDay += duration
    return step
  })
}

function projectMobilization(
  mobilization: Mobilization,
  scopesByMobilizationId: Map<string, TradeScope[]>,
): SequenceMobilizationProjection {
  const scopes = [...(scopesByMobilizationId.get(mobilization.id) ?? [])].sort(compareScopes)
  const derivedSteps = buildProjectedSteps(mobilization, scopes, mobilization.startOffset)
  const derivedDuration = derivedSteps.reduce((sum, step) => sum + step.duration, 0)
  const projectedDuration = Math.max(mobilization.duration, derivedDuration)

  return {
    ...mobilization,
    scopes,
    steps: derivedSteps,
    desiredStartOffset: mobilization.startOffset,
    resolvedStartOffset: mobilization.startOffset,
    projectedDuration,
    derivedDuration,
    resolvedEndOffset: mobilization.startOffset + projectedDuration,
  }
}

function compareProjectedMobilizations(
  a: SequenceMobilizationProjection,
  b: SequenceMobilizationProjection,
) {
  if (a.resolvedStartOffset !== b.resolvedStartOffset) {
    return a.resolvedStartOffset - b.resolvedStartOffset
  }
  if (a.projectedDuration !== b.projectedDuration) {
    return a.projectedDuration - b.projectedDuration
  }
  return a.id.localeCompare(b.id)
}

function layoutTradeMobilizations(
  mobilizations: SequenceMobilizationProjection[],
): SequenceMobilizationProjection[] {
  const sorted = [...mobilizations].sort((a, b) => {
    if (a.desiredStartOffset !== b.desiredStartOffset) {
      return a.desiredStartOffset - b.desiredStartOffset
    }
    if (a.projectedDuration !== b.projectedDuration) {
      return a.projectedDuration - b.projectedDuration
    }
    return a.id.localeCompare(b.id)
  })

  let cursor = 0

  return sorted.map((mobilization) => {
    const resolvedStartOffset = Math.max(mobilization.desiredStartOffset, cursor)
    const steps = buildProjectedSteps(
      mobilization,
      mobilization.scopes,
      resolvedStartOffset,
    )
    const derivedDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    const projectedDuration = Math.max(mobilization.projectedDuration, derivedDuration, mobilization.duration)
    const resolvedEndOffset = resolvedStartOffset + projectedDuration
    cursor = resolvedEndOffset

    return {
      ...mobilization,
      steps,
      derivedDuration,
      projectedDuration,
      resolvedStartOffset,
      resolvedEndOffset,
    }
  })
}

export function buildProjection(data: ProjectExecutionData): SequenceProjection {
  const scopesByMobilizationId = new Map<string, TradeScope[]>()

  data.tradeScopes.forEach((scope) => {
    if (!scope.mobilizationId) return
    const current = scopesByMobilizationId.get(scope.mobilizationId) ?? []
    current.push(scope)
    scopesByMobilizationId.set(scope.mobilizationId, current)
  })

  const projectedByTrade = new Map<string, SequenceMobilizationProjection[]>()

  ;[...data.mobilizations]
    .sort(compareMobilizations)
    .map((mobilization) => projectMobilization(mobilization, scopesByMobilizationId))
    .forEach((mobilization) => {
      const current = projectedByTrade.get(mobilization.projectTradeId) ?? []
      current.push(mobilization)
      projectedByTrade.set(mobilization.projectTradeId, current)
    })

  const mobilizations = Array.from(projectedByTrade.values())
    .flatMap((tradeMobilizations) => layoutTradeMobilizations(tradeMobilizations))
    .sort(compareProjectedMobilizations)

  const gates = [...data.gates]
    .sort((a, b) => a.order - b.order)
    .map((gate) => {
      const gateMobilizations = mobilizations.filter((mobilization) => mobilization.gateId === gate.id)

      return {
        gate,
        mobilizations: gateMobilizations,
        tradeCount: new Set(gateMobilizations.map((mobilization) => mobilization.projectTradeId)).size,
        stepCount: gateMobilizations.reduce((count, mobilization) => count + mobilization.steps.length, 0),
        markerCount: gateMobilizations.reduce((count, mobilization) => count + mobilization.markers.length, 0),
      }
    })

  const trades = [...data.projectTrades]
    .map((projectTrade) => {
      const tradeMobilizations = mobilizations.filter((mobilization) => mobilization.projectTradeId === projectTrade.id)

      return {
        projectTrade,
        mobilizations: tradeMobilizations,
        gateIds: Array.from(new Set(tradeMobilizations.map((mobilization) => mobilization.gateId))),
        stepCount: tradeMobilizations.reduce((count, mobilization) => count + mobilization.steps.length, 0),
        markerCount: tradeMobilizations.reduce((count, mobilization) => count + mobilization.markers.length, 0),
      }
    })
    .sort((a, b) => {
      const aFirst = a.mobilizations[0]
      const bFirst = b.mobilizations[0]

      if (aFirst && bFirst) return compareProjectedMobilizations(aFirst, bFirst)
      if (aFirst) return -1
      if (bFirst) return 1
      return a.projectTrade.tradeType.name.localeCompare(b.projectTrade.tradeType.name)
    })

  return {
    projectId: data.project.id,
    generatedAt: new Date().toISOString(),
    totals: {
      gateCount: data.gates.length,
      tradeCount: data.projectTrades.length,
      mobilizationCount: mobilizations.length,
      stepCount: mobilizations.reduce((count, mobilization) => count + mobilization.steps.length, 0),
      markerCount: mobilizations.reduce((count, mobilization) => count + mobilization.markers.length, 0),
      scopeCount: data.tradeScopes.length,
    },
    mobilizations,
    gates,
    trades,
  }
}
