import { notFound } from 'next/navigation'
import { getProject, getClient } from '@/lib/dataverse/adapter'
import { ProjectHome } from '@/features/projects/project-home'

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) notFound()

  const client = project.clientId ? await getClient(project.clientId) : null

  return (
    <ProjectHome
      project={project}
      clientName={client?.name}
    />
  )
}
