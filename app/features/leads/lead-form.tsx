'use client'

import { Modal } from '@/components/modal'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'
import { createLeadAction } from './actions'

interface LeadFormProps {
  open: boolean
  onClose: () => void
}

export function LeadForm({ open, onClose }: LeadFormProps) {
  async function handleSubmit(formData: FormData) {
    await createLeadAction(formData)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Lead">
      <form action={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input name="name" label="Name" required />
          <Input name="email" type="email" label="Email" />
          <Input name="phone" type="tel" label="Phone" />
          <Input name="projectAddress" label="Project Address" />
          <Textarea name="projectDescription" label="Project Description" rows={3} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Create Lead</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
