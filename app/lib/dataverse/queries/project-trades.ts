// ============================================================
// Dataverse Queries — Project Trades
// ============================================================
// Dataverse table: rlh_projecttrades
// ============================================================

import { dvGet } from '../client'
import type { ProjectTrade, ProjectTradeStage, TradeType } from '@/types/database'

const STAGE_MAP: Record<number, ProjectTradeStage> = {
  936880000: 'planned',
  936880001: 'in_progress',
  936880002: 'complete',
}

interface DvProjectTrade {
  rlh_projecttradeid: string
  _rlh_projectid_value: string
  _cr6cd_tradeid_value: string
  rlh_stage?: number
  _rlh_companyid_value?: string
  // Expanded trade (when $expand=cr6cd_tradeid used)
  cr6cd_tradeid?: {
    cr6cd_tradeid: string
    cr6cd_name: string
    cr6cd_tradecode?: string
    cr6cd_color?: string
  }
}

function toProjectTrade(dv: DvProjectTrade): ProjectTrade {
  const tradeType: TradeType = dv.cr6cd_tradeid
    ? {
        id: dv.cr6cd_tradeid.cr6cd_tradeid,
        name: dv.cr6cd_tradeid.cr6cd_name,
        code: dv.cr6cd_tradeid.cr6cd_tradecode ?? '',
        color: dv.cr6cd_tradeid.cr6cd_color,
      }
    : {
        id: dv._cr6cd_tradeid_value,
        name: '(unknown trade)',
        code: '???',
      }

  return {
    id: dv.rlh_projecttradeid,
    projectId: dv._rlh_projectid_value,
    tradeTypeId: dv._cr6cd_tradeid_value,
    tradeType,
    stage: STAGE_MAP[dv.rlh_stage ?? 936880000] ?? 'planned',
    companyId: dv._rlh_companyid_value,
  }
}

export async function getProjectTrades(projectId: string): Promise<ProjectTrade[]> {
  const res = await dvGet<{ value: DvProjectTrade[] }>(
    `rlh_projecttrades?$select=rlh_projecttradeid,_rlh_projectid_value,_cr6cd_tradeid_value,rlh_stage,_rlh_companyid_value&$expand=cr6cd_tradeid($select=cr6cd_tradeid,cr6cd_name,cr6cd_tradecode,cr6cd_color)&$filter=_rlh_projectid_value eq '${projectId}'`
  )
  return res.value.map(toProjectTrade)
}
