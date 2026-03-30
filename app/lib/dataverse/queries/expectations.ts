// ============================================================
// Dataverse Queries — Expectations
// ============================================================
// Dataverse tables:
//   rlh_expectations (org-level library)
//   rlh_projectexpectations (project junction)
// ============================================================

import { dvGet } from '../client'
import type { Expectation, ProjectExpectation, ExpectationCategory, ProjectExpectationSource } from '@/types/database'

const CATEGORY_MAP: Record<number, ExpectationCategory> = {
  936880000: 'general',
  936880001: 'communication',
  936880002: 'site_conditions',
  936880003: 'preparation_coordination',
  936880004: 'quality_standards',
}

const SOURCE_MAP: Record<number, ProjectExpectationSource> = {
  936880000: 'auto',
  936880001: 'manual',
}

// ── Dataverse shapes ────────────────────────────────────────

interface DvExpectation {
  rlh_expectationid: string
  rlh_description: string
  rlh_category?: number
  _rlh_tradetype_value?: string
  rlh_isactive?: boolean
  createdon?: string
  modifiedon?: string
}

interface DvProjectExpectation {
  rlh_projectexpectationid: string
  _rlh_project_value: string
  _rlh_expectation_value: string
  rlh_isincluded?: boolean
  rlh_customtext?: string
  rlh_sortorder?: number
  rlh_source?: number
}

// ── Transformers ────────────────────────────────────────────

function toExpectation(dv: DvExpectation): Expectation {
  return {
    id: dv.rlh_expectationid,
    description: dv.rlh_description,
    category: CATEGORY_MAP[dv.rlh_category ?? 936880000] ?? 'general',
    tradeTypeId: dv._rlh_tradetype_value,
    isActive: dv.rlh_isactive ?? true,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

function toProjectExpectation(dv: DvProjectExpectation): ProjectExpectation {
  return {
    id: dv.rlh_projectexpectationid,
    projectId: dv._rlh_project_value,
    expectationId: dv._rlh_expectation_value,
    isIncluded: dv.rlh_isincluded ?? true,
    customText: dv.rlh_customtext,
    sortOrder: dv.rlh_sortorder,
    source: SOURCE_MAP[dv.rlh_source ?? 936880000] ?? 'auto',
  }
}

// ── Queries ─────────────────────────────────────────────────

export async function getExpectations(): Promise<Expectation[]> {
  const res = await dvGet<{ value: DvExpectation[] }>(
    `rlh_expectations?$select=rlh_expectationid,rlh_description,rlh_category,_rlh_tradetype_value,rlh_isactive,createdon,modifiedon&$filter=rlh_isactive eq true&$orderby=rlh_category asc,createdon asc`
  )
  return res.value.map(toExpectation)
}

export async function getProjectExpectations(projectId: string): Promise<ProjectExpectation[]> {
  const res = await dvGet<{ value: DvProjectExpectation[] }>(
    `rlh_projectexpectations?$select=rlh_projectexpectationid,_rlh_project_value,_rlh_expectation_value,rlh_isincluded,rlh_customtext,rlh_sortorder,rlh_source&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_sortorder asc`
  )
  return res.value.map(toProjectExpectation)
}
