'use client'

import { useState } from 'react'
import type {
  Company,
  CompanyType,
  TradeType,
  Contact,
  ContactRole,
  Capability,
  CompanyCapability,
} from '@/types/database'
import { CompaniesView } from '@/features/companies/companies-view'
import { PeopleView } from '@/features/people/people-view'

type Tab = 'companies' | 'people'

interface ContactsViewProps {
  companies: Company[]
  companyTypes: CompanyType[]
  tradeTypes: TradeType[]
  contacts: Contact[]
  contactRoles: ContactRole[]
  capabilities: Capability[]
  companyCapabilities: CompanyCapability[]
}

export function ContactsView({
  companies,
  companyTypes,
  tradeTypes,
  contacts,
  contactRoles,
  capabilities,
  companyCapabilities,
}: ContactsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('companies')

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          padding: 'var(--space-3) var(--space-7) 0',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {(['companies', 'people'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              textTransform: 'capitalize',
              fontFamily: 'inherit',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'companies' ? (
        <CompaniesView
          companies={companies}
          companyTypes={companyTypes}
          tradeTypes={tradeTypes}
          contacts={contacts}
          capabilities={capabilities}
          companyCapabilities={companyCapabilities}
        />
      ) : (
        <PeopleView
          contacts={contacts}
          companies={companies}
          contactRoles={contactRoles}
        />
      )}
    </div>
  )
}
