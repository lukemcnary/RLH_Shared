import { getLeads } from '@/lib/dataverse/adapter'
import { LeadsBoard } from '@/features/leads/leads-board'

export const metadata = { title: 'Leads — RangelineOS' }

export default async function LeadsPage() {
  const clients = await getLeads()
  return <LeadsBoard initialClients={clients} />
}
