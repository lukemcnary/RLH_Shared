'use server'

import { revalidatePath } from 'next/cache'
import { createScopeItem } from '@/lib/dataverse/adapter'

export async function createScopeItemAction(projectId: string, formData: FormData) {
  await createScopeItem({
    projectId,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    tradeTypeId: (formData.get('tradeTypeId') as string) || undefined,
  })
  revalidatePath(`/projects/${projectId}/scope-items`)
}
