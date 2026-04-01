// ============================================================
// Dataverse Queries — Expectations
// ============================================================
// Dataverse tables:
//   rlh_expectations (org-level library)
//   rlh_projectexpectations (project junction)
// ============================================================

import { dvGet } from '../client'
import type { Expectation, ProjectExpectation } from '@/types/database'
import {
  type DvExpectation,
  type DvProjectExpectation,
  toExpectation,
  toProjectExpectation,
} from '../mappers'

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
