import { getProject } from '@/lib/dataverse/adapter'
import { notFound } from 'next/navigation'
import { ProjectTabs } from '@/features/projects/project-tabs'
import Link from 'next/link'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) notFound()

  return (
    <div
      className="flex"
      style={{
        height: 'calc(100vh - 64px)',
      }}
    >
      <aside
        className="shrink-0 flex flex-col overflow-y-auto"
        style={{
          width: 192,
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-light)',
          zIndex: 10,
        }}
      >
        {/* Project header */}
        <div style={{ padding: '14px 14px 12px' }}>
          <Link
            href="/projects"
            className="hover:opacity-70"
            style={{
              color: 'var(--text-tertiary)',
              fontSize: 11,
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 4,
            }}
          >
            &larr; Projects
          </Link>
          <Link
            href={`/projects/${id}`}
            className="truncate"
            style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {project.name}
          </Link>
          {project.address && (
            <p className="truncate" style={{ color: 'var(--text-tertiary)', marginTop: 2, fontSize: 11, lineHeight: 1.3 }}>
              {project.address}
            </p>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-light)', margin: '0 10px' }} />

        {/* Nav tabs */}
        <div style={{ padding: '10px 10px 0', flex: 1 }}>
          <ProjectTabs projectId={id} />
        </div>
      </aside>

      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
