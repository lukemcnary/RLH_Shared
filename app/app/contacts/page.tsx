import {
  getCompanies,
  getCompanyTypes,
  getTradeTypes,
  getContacts,
  getContactRoles,
  getCapabilities,
  getCompanyCapabilities,
} from '@/lib/dataverse/adapter'
import { ContactsView } from '@/features/contacts/contacts-view'

export const metadata = { title: 'Contacts — RangelineOS' }

export default async function ContactsPage() {
  const [companies, companyTypes, tradeTypes, contacts, contactRoles, capabilities, companyCapabilities] =
    await Promise.all([
      getCompanies(),
      getCompanyTypes(),
      getTradeTypes(),
      getContacts(),
      getContactRoles(),
      getCapabilities(),
      getCompanyCapabilities(),
    ])

  return (
    <ContactsView
      companies={companies}
      companyTypes={companyTypes}
      tradeTypes={tradeTypes}
      contacts={contacts}
      contactRoles={contactRoles}
      capabilities={capabilities}
      companyCapabilities={companyCapabilities}
    />
  )
}
