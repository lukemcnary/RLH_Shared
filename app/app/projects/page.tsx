export const dynamic = 'force-dynamic'

import { getProjects } from '@/lib/dataverse/adapter'
import { ProjectsView } from '@/features/projects/projects-view'

export const metadata = { title: 'Projects — RangelineOS' }

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectsView projects={projects} />
}
