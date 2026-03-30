'use client'

import { useState } from 'react'
import type { Project } from '@/types/database'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { SidePanel } from '@/components/side-panel'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'

interface ProjectHomeProps {
  project: Project
  clientName?: string
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div
        className="text-xs font-semibold uppercase"
        style={{
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
          marginBottom: 'var(--space-1)',
        }}
      >
        {label}
      </div>
      <div className="text-sm" style={{ color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
        {value || '—'}
      </div>
    </div>
  )
}

export function ProjectHome({ project, clientName }: ProjectHomeProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draft, setDraft] = useState(project)

  const handleSave = () => {
    // TODO: wire up server action to persist changes to Dataverse
    setSettingsOpen(false)
  }

  return (
    <div style={{ padding: '40px var(--space-6)', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 'var(--space-5)' }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {project.name}
          </h1>
          <Badge color="accent">{project.status.replace('_', ' ')}</Badge>
        </div>
        <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
          Project Settings
        </Button>
      </div>

      {/* Details grid */}
      <section
        style={{
          backgroundColor: 'var(--surface-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--space-5)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <DetailField label="Address" value={project.address} />
          <DetailField label="Client" value={clientName ?? project.client?.name} />
          <DetailField label="Start Date" value={project.startDate} />
          <DetailField label="Completion Date" value={project.completionDate} />
          <DetailField label="Gate Code" value={project.gateCode} />
          <DetailField label="WiFi Password" value={project.wifiPassword} />
          <DetailField label="Hours of Operation" value={project.hoursOfOperation} />
          <DetailField label="Permit Number" value={project.permitNumber} />
        </div>
      </section>

      {/* Project Settings Side Panel */}
      <SidePanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Project Settings"
        headerActions={
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Project Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <Input
            label="Address"
            value={draft.address ?? ''}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Start Date"
              type="date"
              value={draft.startDate ?? ''}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            />
            <Input
              label="Completion Date"
              type="date"
              value={draft.completionDate ?? ''}
              onChange={(e) => setDraft({ ...draft, completionDate: e.target.value })}
            />
          </div>
          <Input
            label="Gate Code"
            value={draft.gateCode ?? ''}
            onChange={(e) => setDraft({ ...draft, gateCode: e.target.value })}
          />
          <Input
            label="WiFi Password"
            value={draft.wifiPassword ?? ''}
            onChange={(e) => setDraft({ ...draft, wifiPassword: e.target.value })}
          />
          <Textarea
            label="Hours of Operation"
            value={draft.hoursOfOperation ?? ''}
            onChange={(e) => setDraft({ ...draft, hoursOfOperation: e.target.value })}
            rows={2}
          />
          <Input
            label="Permit Number"
            value={draft.permitNumber ?? ''}
            onChange={(e) => setDraft({ ...draft, permitNumber: e.target.value })}
          />
        </div>
      </SidePanel>
    </div>
  )
}
