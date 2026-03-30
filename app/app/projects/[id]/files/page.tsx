import { notFound } from 'next/navigation'
import { ProjectFilesView } from '@/features/files/files-view'
import { getProjectFilesHubData } from '@/lib/sharepoint/project-files'

export const metadata = { title: 'Files — RangelineOS' }

export default async function FilesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getProjectFilesHubData(id)

  if (!data) notFound()

  return <ProjectFilesView projectId={id} data={data} />
}
