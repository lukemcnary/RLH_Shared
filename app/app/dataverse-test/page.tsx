import { redirect } from 'next/navigation'

export const metadata = { title: 'Dataverse Test — RangelineOS' }

export default function DataverseTestPage() {
  redirect('/dataverse-test/index.html')
}
