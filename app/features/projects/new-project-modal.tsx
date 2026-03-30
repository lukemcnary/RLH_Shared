'use client'

import { Modal } from '@/components/modal'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { createProjectAction } from './actions'

interface NewProjectModalProps {
  open: boolean
  onClose: () => void
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  async function handleSubmit(formData: FormData) {
    await createProjectAction(formData)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <form action={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input name="name" label="Project Name" required />
          <Input name="address" label="Address" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input name="startDate" label="Start Date" type="date" />
            <Input name="completionDate" label="Target Completion" type="date" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Create Project</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
