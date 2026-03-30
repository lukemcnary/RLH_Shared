'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/types/database'
import { Button } from '@/components/button'
import { projectHref } from './routes'
import { NewProjectModal } from './new-project-modal'

interface ProjectsViewProps {
  projects: Project[]
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [showNew, setShowNew] = useState(false)

  return (
    <div style={{ padding: '40px var(--space-6)' }}>
      {/* Page header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 'var(--space-5)' }}
      >
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Projects
        </h1>
        <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
          New Project
        </Button>
      </div>

      <NewProjectModal open={showNew} onClose={() => setShowNew(false)} />

      {/* Project list */}
      {projects.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-7)',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
          }}
        >
          <p className="text-sm">No projects yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={projectHref(project.id)}
              className="hover-row"
              style={{
                display: 'block',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {project.name}
                  </div>
                  {project.address && (
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}
                    >
                      {project.address}
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                  }}
                >
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
