'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Project } from '@/types/database'
import { createDefaultGates } from '@/lib/dataverse/adapter'

async function mock() {
  return await import('@/lib/mock-data')
}

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string
  if (!name?.trim()) throw new Error('Project name is required')

  if (IS_MOCK) {
    const m = await mock()
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      address: (formData.get('address') as string) || undefined,
      startDate: (formData.get('startDate') as string) || undefined,
      completionDate: (formData.get('completionDate') as string) || undefined,
      status: 'planning',
    }
    m.MOCK_PROJECTS.push(newProject)
    await createDefaultGates(newProject.id)
    revalidatePath('/projects')
    redirect(`/projects/${newProject.id}/budget`)
  }

  throw new Error('Not implemented for Dataverse')
}
