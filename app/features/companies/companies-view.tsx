'use client'

import { useState, useMemo } from 'react'
import type { Company, CompanyType, TradeType, Contact, Capability, CompanyCapability } from '@/types/database'
import { Badge } from '@/components/badge'
import { SidePanel } from '@/components/side-panel'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

// ── Rating config ────────────────────────────────────────────

const RATING_LABELS: Record<string, string> = {
  unknown: 'Unknown',
  basic: 'Basic',
  competent: 'Competent',
  strong: 'Strong',
  preferred: 'Preferred',
}

const RATING_COLORS: Record<string, 'gray' | 'accent' | 'yellow' | 'green' | 'purple'> = {
  unknown: 'gray',
  basic: 'gray',
  competent: 'accent',
  strong: 'green',
  preferred: 'purple',
}

// ── DetailRow helper ──────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--border-light)',
        alignItems: 'start',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{children}</div>
    </div>
  )
}

// ── CompanyRow ────────────────────────────────────────────────

interface CompanyRowProps {
  company: Company
  companyTypes: CompanyType[]
  tradeTypes: TradeType[]
  contactCount: number
  onClick: () => void
}

function CompanyRow({ company, companyTypes, tradeTypes, contactCount, onClick }: CompanyRowProps) {
  const linkedTypes = companyTypes.filter((ct) => company.companyTypeIds?.includes(ct.id))
  const linkedTrades = tradeTypes.filter((tt) => company.tradeTypeIds?.includes(tt.id))

  return (
    <div
      className="hover-row"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
      }}
    >
      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 2,
          }}
        >
          <span
            className="text-sm"
            style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {company.name}
          </span>
        </div>

        {/* Badges row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            flexWrap: 'wrap',
          }}
        >
          {linkedTypes.map((ct) => (
            <Badge key={ct.id} color="gray">{ct.name}</Badge>
          ))}
          {linkedTrades.map((tt) => (
            <Badge key={tt.id} color="accent">{tt.code}</Badge>
          ))}
        </div>
      </div>

      {/* Contact count */}
      <span
        className="text-xs"
        style={{
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {contactCount} contact{contactCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

// ── CompanyDetail (SidePanel content) ────────────────────────

interface CompanyDetailProps {
  company: Company
  companyTypes: CompanyType[]
  tradeTypes: TradeType[]
  contacts: Contact[]
  capabilities: Capability[]
  companyCapabilities: CompanyCapability[]
}

function CompanyDetail({ company, companyTypes, tradeTypes, contacts, capabilities, companyCapabilities }: CompanyDetailProps) {
  const linkedTypes = companyTypes.filter((ct) => company.companyTypeIds?.includes(ct.id))
  const linkedTrades = tradeTypes.filter((tt) => company.tradeTypeIds?.includes(tt.id))
  const linkedContacts = contacts.filter((c) => c.companyId === company.id)
  const linkedCapabilities = companyCapabilities.filter((cc) => cc.companyId === company.id)

  return (
    <div>
      {/* Contact info section */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        {company.phone && (
          <DetailRow label="Phone">
            <span style={{ color: 'var(--text-secondary)' }}>{company.phone}</span>
          </DetailRow>
        )}
        {company.email && (
          <DetailRow label="Email">
            <a href={`mailto:${company.email}`} style={{ color: 'var(--accent)', fontSize: 13 }}>
              {company.email}
            </a>
          </DetailRow>
        )}
        {company.website && (
          <DetailRow label="Website">
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', fontSize: 13 }}
            >
              {company.website}
            </a>
          </DetailRow>
        )}
        {company.address && (
          <DetailRow label="Address">
            <span style={{ color: 'var(--text-secondary)' }}>{company.address}</span>
          </DetailRow>
        )}
      </div>

      {/* Company types section */}
      {linkedTypes.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>
            Company Types
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            {linkedTypes.map((ct) => (
              <Badge key={ct.id} color="gray">{ct.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Trade types section */}
      {linkedTrades.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>
            Trade Types
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            {linkedTrades.map((tt) => (
              <Badge key={tt.id} color={tt.color ? 'accent' : 'accent'}>
                {tt.code} — {tt.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Capabilities section */}
      {linkedCapabilities.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>
            Capabilities
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            {linkedCapabilities.map((cc) => {
              const cap = capabilities.find((c) => c.id === cc.capabilityId)
              if (!cap) return null
              return (
                <div
                  key={cc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--border-light)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    {cap.name}
                  </span>
                  <Badge color={RATING_COLORS[cc.rating] ?? 'gray'}>
                    {RATING_LABELS[cc.rating] ?? cc.rating}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Contacts section */}
      {linkedContacts.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>
            Contacts
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            {linkedContacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {contact.fullName}
                </div>
                {contact.title && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                    {contact.title}
                  </div>
                )}
                {contact.email && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>
                    {contact.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── CompanyTypeGroup ─────────────────────────────────────────

interface CompanyTypeGroupProps {
  label: string
  companies: Company[]
  allCompanyTypes: CompanyType[]
  allTradeTypes: TradeType[]
  contactCounts: Map<string, number>
  onSelectCompany: (company: Company) => void
}

function CompanyTypeGroup({ label, companies, allCompanyTypes, allTradeTypes, contactCounts, onSelectCompany }: CompanyTypeGroupProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      {/* Group header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--surface-muted)',
          cursor: 'pointer',
          borderRadius: 'var(--radius)',
          userSelect: 'none',
        }}
      >
        {/* Chevron */}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{
            color: 'var(--accent)',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Group name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            flex: 1,
          }}
        >
          {label}
        </span>

        {/* Item count */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--accent)',
            backgroundColor: 'var(--accent-medium)',
            padding: '1px var(--space-2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {companies.length}
        </span>
      </div>

      {/* Items */}
      {expanded && (
        <div
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 var(--radius) var(--radius)',
            overflow: 'hidden',
          }}
        >
          {companies.map((company) => (
            <CompanyRow
              key={company.id}
              company={company}
              companyTypes={allCompanyTypes}
              tradeTypes={allTradeTypes}
              contactCount={contactCounts.get(company.id) ?? 0}
              onClick={() => onSelectCompany(company)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main CompaniesView ───────────────────────────────────────

interface CompaniesViewProps {
  companies: Company[]
  companyTypes: CompanyType[]
  tradeTypes: TradeType[]
  contacts: Contact[]
  capabilities: Capability[]
  companyCapabilities: CompanyCapability[]
}

export function CompaniesView({ companies, companyTypes, tradeTypes, contacts, capabilities, companyCapabilities }: CompaniesViewProps) {
  const [search, setSearch] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Pre-compute contact counts per company
  const contactCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const contact of contacts) {
      if (contact.companyId) {
        map.set(contact.companyId, (map.get(contact.companyId) ?? 0) + 1)
      }
    }
    return map
  }, [contacts])

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return companies
    const q = search.toLowerCase()
    return companies.filter((company) => {
      if (company.name.toLowerCase().includes(q)) return true
      // Match by trade type names
      const companyTradeNames = tradeTypes
        .filter((tt) => company.tradeTypeIds?.includes(tt.id))
        .map((tt) => tt.name.toLowerCase())
      if (companyTradeNames.some((name) => name.includes(q))) return true
      // Match by company type names
      const companyTypeNames = companyTypes
        .filter((ct) => company.companyTypeIds?.includes(ct.id))
        .map((ct) => ct.name.toLowerCase())
      if (companyTypeNames.some((name) => name.includes(q))) return true
      return false
    })
  }, [companies, tradeTypes, companyTypes, search])

  // Group by company type
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; companies: Company[] }>()

    for (const company of filtered) {
      const typeIds = company.companyTypeIds ?? []
      if (typeIds.length === 0) {
        // Companies with no type go into "Uncategorized"
        const key = '__none__'
        if (!map.has(key)) {
          map.set(key, { label: 'Uncategorized', companies: [] })
        }
        map.get(key)!.companies.push(company)
      } else {
        // A company may appear in multiple type groups
        for (const typeId of typeIds) {
          const ct = companyTypes.find((t) => t.id === typeId)
          const label = ct?.name ?? 'Unknown'
          if (!map.has(typeId)) {
            map.set(typeId, { label, companies: [] })
          }
          map.get(typeId)!.companies.push(company)
        }
      }
    }

    // Sort named groups first, "Uncategorized" last
    return Array.from(map.entries())
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => {
        if (a.key === '__none__') return 1
        if (b.key === '__none__') return -1
        return a.label.localeCompare(b.label)
      })
  }, [filtered, companyTypes])

  if (companies.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
        <PageHeader title="Companies" />
        <EmptyState
          title="No companies yet"
          description="Add companies to manage your trade partners, vendors, and subcontractors."
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="Companies">
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
          {filtered.length} of {companies.length} companies
        </span>
      </PageHeader>

      {/* Search bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 13,
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different search term."
        />
      ) : (
        <div>
          {groups.map((group) => (
            <CompanyTypeGroup
              key={group.key}
              label={group.label}
              companies={group.companies}
              allCompanyTypes={companyTypes}
              allTradeTypes={tradeTypes}
              contactCounts={contactCounts}
              onSelectCompany={setSelectedCompany}
            />
          ))}
        </div>
      )}

      {/* Side panel */}
      <SidePanel
        open={selectedCompany !== null}
        onClose={() => setSelectedCompany(null)}
        title={selectedCompany?.name ?? ''}
      >
        {selectedCompany && (
          <CompanyDetail
            company={selectedCompany}
            companyTypes={companyTypes}
            tradeTypes={tradeTypes}
            contacts={contacts}
            capabilities={capabilities}
            companyCapabilities={companyCapabilities}
          />
        )}
      </SidePanel>
    </div>
  )
}
