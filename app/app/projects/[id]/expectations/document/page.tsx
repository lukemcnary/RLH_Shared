import { getProjectExpectations, getExpectations, getProject } from '@/lib/dataverse/adapter'
import { ExpectationsDocument } from '@/features/expectations/expectations-document'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Expectations Document — RangelineOS' }

export default async function ExpectationsDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, projectExpectations, expectations] = await Promise.all([
    getProject(id),
    getProjectExpectations(id),
    getExpectations(),
  ])

  if (!project) notFound()

  // Join expectations onto project expectations and filter to included only
  const included = projectExpectations
    .filter(pe => pe.isIncluded)
    .map(pe => ({
      ...pe,
      expectation: pe.expectation ?? expectations.find(e => e.id === pe.expectationId),
    }))
    .filter(pe => pe.expectation)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  return (
    <ExpectationsDocument
      projectName={project.name}
      projectExpectations={included}
    />
  )
}
