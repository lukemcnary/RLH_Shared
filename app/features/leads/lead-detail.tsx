'use client'

import { useState } from 'react'
import type { Client, ClientStatus } from '@/types/database'
import { CLIENT_BOARD_STATUSES, CLIENT_STATUS_LABELS } from '@/types/database'
import { SidePanel } from '@/components/side-panel'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'
import { updateLeadAction, deleteLeadAction } from './actions'

interface LeadDetailProps {
  client: Client
  open: boolean
  onClose: () => void
  onUpdated: (updated: Client) => void
  onDeleted: (id: string) => void
}

export function LeadDetail({ client, open, onClose, onUpdated, onDeleted }: LeadDetailProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(client)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave() {
    const fd = new FormData()
    fd.set('name', draft.name)
    fd.set('email', draft.email ?? '')
    fd.set('phone', draft.phone ?? '')
    fd.set('projectAddress', draft.projectAddress ?? '')
    fd.set('projectDescription', draft.projectDescription ?? '')
    fd.set('source', draft.source ?? '')
    fd.set('status', draft.status)
    await updateLeadAction(client.id, fd)
    onUpdated(draft)
    setEditing(false)
  }

  async function handleDelete() {
    await deleteLeadAction(client.id)
    onDeleted(client.id)
    onClose()
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Lead' : client.name}
      headerActions={
        !editing ? (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        ) : (
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
        )
      }
    >
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input label="Name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          <Input label="Email" value={draft.email ?? ''} onChange={e => setDraft({ ...draft, email: e.target.value })} />
          <Input label="Phone" value={draft.phone ?? ''} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
          <Input label="Project Address" value={draft.projectAddress ?? ''} onChange={e => setDraft({ ...draft, projectAddress: e.target.value })} />
          <Textarea label="Project Description" value={draft.projectDescription ?? ''} onChange={e => setDraft({ ...draft, projectDescription: e.target.value })} rows={3} />
          <Input label="Source" value={draft.source ?? ''} onChange={e => setDraft({ ...draft, source: e.target.value })} />
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 4 }}>Status</label>
            <select
              value={draft.status}
              onChange={e => setDraft({ ...draft, status: e.target.value as ClientStatus })}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface-primary)',
                fontFamily: 'inherit',
              }}
            >
              {CLIENT_BOARD_STATUSES.map(s => (
                <option key={s} value={s}>{CLIENT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            {!confirmDelete ? (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete Lead</Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="text-sm" style={{ color: 'var(--danger)' }}>Are you sure?</span>
                <Button variant="danger" size="sm" onClick={handleDelete}>Yes, Delete</Button>
                <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <DetailField label="Email" value={client.email} />
          <DetailField label="Phone" value={client.phone} />
          <DetailField label="Project Address" value={client.projectAddress} />
          <DetailField label="Project Description" value={client.projectDescription} />
          <DetailField label="Source" value={client.source} />
          {client.createdAt && (
            <DetailField label="Created" value={new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
          )}
        </div>
      )}
    </SidePanel>
  )
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>
        {label}
      </div>
      <div className="text-sm" style={{ color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
        {value || '—'}
      </div>
    </div>
  )
}
