'use client'

import { useState } from 'react'
import type { Client } from '@/types/database'
import { Modal } from '@/components/modal'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { createProjectFromLeadAction } from './actions'

interface ProjectWizardProps {
  client: Client
  open: boolean
  onClose: () => void
}

export function ProjectWizard({ client, open, onClose }: ProjectWizardProps) {
  const [step, setStep] = useState(1)
  const [values, setValues] = useState({
    name: client.name,
    address: client.projectAddress ?? '',
    startDate: '',
    completionDate: '',
  })

  async function handleCreate() {
    const fd = new FormData()
    fd.set('name', values.name)
    fd.set('address', values.address)
    fd.set('startDate', values.startDate)
    fd.set('completionDate', values.completionDate)
    await createProjectFromLeadAction(client.id, fd)
  }

  return (
    <Modal open={open} onClose={onClose} title={step === 1 ? 'Create Project' : 'Confirm'}>
      {step === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input
            label="Project Name"
            value={values.name}
            onChange={e => setValues({ ...values, name: e.target.value })}
            required
          />
          <Input
            label="Address"
            value={values.address}
            onChange={e => setValues({ ...values, address: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Start Date"
              type="date"
              value={values.startDate}
              onChange={e => setValues({ ...values, startDate: e.target.value })}
            />
            <Input
              label="Target Completion"
              type="date"
              value={values.completionDate}
              onChange={e => setValues({ ...values, completionDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => setStep(2)} disabled={!values.name.trim()}>
              Next
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            backgroundColor: 'var(--surface-muted)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}>
            <ConfirmField label="Project Name" value={values.name} />
            <ConfirmField label="Address" value={values.address} />
            <ConfirmField label="Client" value={client.name} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <ConfirmField label="Start Date" value={values.startDate} />
              <ConfirmField label="Target Completion" value={values.completionDate} />
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            This will create the project and move the lead to converted status.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" onClick={handleCreate}>Create Project</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function ConfirmField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: 2 }}>
        {label}
      </div>
      <div className="text-sm" style={{ color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
        {value || '—'}
      </div>
    </div>
  )
}
