'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ClientStatus } from '@/types/database'
import {
  createLead,
  updateLeadStatus as adapterUpdateStatus,
  updateLead as adapterUpdateLead,
  deleteLead as adapterDeleteLead,
  createProjectFromLead as adapterCreateProject,
} from '@/lib/dataverse/adapter'

export async function createLeadAction(formData: FormData) {
  await createLead({
    name: (formData.get('name') as string) || '',
    email: (formData.get('email') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    projectAddress: (formData.get('projectAddress') as string) || undefined,
    projectDescription: (formData.get('projectDescription') as string) || undefined,
    source: (formData.get('source') as string) || undefined,
    status: 'new',
  })
  revalidatePath('/leads')
}

export async function updateLeadStatusAction(clientId: string, status: ClientStatus) {
  await adapterUpdateStatus(clientId, status)
  revalidatePath('/leads')
}

export async function updateLeadAction(clientId: string, formData: FormData) {
  await adapterUpdateLead(clientId, {
    name: (formData.get('name') as string) || '',
    email: (formData.get('email') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    projectAddress: (formData.get('projectAddress') as string) || undefined,
    projectDescription: (formData.get('projectDescription') as string) || undefined,
    source: (formData.get('source') as string) || undefined,
    status: (formData.get('status') as ClientStatus) || undefined,
  })
  revalidatePath('/leads')
}

export async function deleteLeadAction(clientId: string) {
  await adapterDeleteLead(clientId)
  revalidatePath('/leads')
}

export async function createProjectFromLeadAction(clientId: string, formData: FormData) {
  const projectId = await adapterCreateProject(clientId, {
    name: formData.get('name') as string,
    address: (formData.get('address') as string) || undefined,
    startDate: (formData.get('startDate') as string) || undefined,
    completionDate: (formData.get('completionDate') as string) || undefined,
  })
  revalidatePath('/leads')
  revalidatePath('/projects')
  redirect(`/projects/${projectId}`)
}
