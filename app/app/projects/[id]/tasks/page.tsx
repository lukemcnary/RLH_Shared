import { getTasks, getGates, getMobilizations, getScopeItems } from '@/lib/dataverse/adapter'
import { TasksView } from '@/features/tasks/tasks-view'

export const metadata = { title: 'Action Items — RangelineOS' }

export default async function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [tasks, gates, mobilizations, scopeItems] = await Promise.all([
    getTasks(id),
    getGates(id),
    getMobilizations(id),
    getScopeItems(id),
  ])

  return <TasksView projectId={id} tasks={tasks} gates={gates} mobilizations={mobilizations} scopeItems={scopeItems} />
}
