'use client'

import { useState, useMemo } from 'react'
import type { Contact, Company, ContactRole } from '@/types/database'
import { SidePanel } from '@/components/side-panel'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

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

// ── ContactRow ───────────────────────────────────────────────

interface ContactRowProps {
  contact: Contact
  companyName?: string
  onClick: () => void
}

function ContactRow({ contact, companyName, onClick }: ContactRowProps) {
  return (
    <div
      className="hover-row"
      onClick={onClick}
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
      }}
    >
      {/* Name */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: companyName || contact.title ? 'var(--space-1)' : 0,
        }}
      >
        {contact.fullName}
      </div>

      {/* Company */}
      {companyName && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginBottom: contact.title ? 2 : 0,
          }}
        >
          {companyName}
        </div>
      )}

      {/* Title */}
      {contact.title && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          {contact.title}
        </div>
      )}
    </div>
  )
}

// ── ContactDetail (SidePanel content) ────────────────────────

interface ContactDetailProps {
  contact: Contact
  companyName?: string
}

function ContactDetail({ contact, companyName }: ContactDetailProps) {
  return (
    <div>
      {/* Title */}
      {contact.title && (
        <div
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {contact.title}
        </div>
      )}

      {/* Detail grid */}
      {contact.email && (
        <DetailRow label="Email">
          <a
            href={`mailto:${contact.email}`}
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            {contact.email}
          </a>
        </DetailRow>
      )}

      {contact.phone && (
        <DetailRow label="Phone">
          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{contact.phone}</span>
        </DetailRow>
      )}

      {companyName && (
        <DetailRow label="Company">
          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{companyName}</span>
        </DetailRow>
      )}

      {contact.createdAt && (
        <DetailRow label="Added">
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </DetailRow>
      )}
    </div>
  )
}

// ── CompanyGroup ─────────────────────────────────────────────

interface CompanyGroupProps {
  companyName: string
  contacts: Contact[]
  companies: Company[]
  onSelectContact: (contact: Contact) => void
}

function CompanyGroup({ companyName, contacts, companies, onSelectContact }: CompanyGroupProps) {
  const [expanded, setExpanded] = useState(true)

  const getCompanyName = (contact: Contact) => {
    if (!contact.companyId) return undefined
    return companies.find((c) => c.id === contact.companyId)?.name
  }

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

        {/* Company name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            flex: 1,
          }}
        >
          {companyName}
        </span>

        {/* Contact count */}
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
          {contacts.length}
        </span>
      </div>

      {/* Contacts */}
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
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              companyName={getCompanyName(contact)}
              onClick={() => onSelectContact(contact)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main PeopleView ──────────────────────────────────────────

interface PeopleViewProps {
  contacts: Contact[]
  companies: Company[]
  contactRoles: ContactRole[]
}

export function PeopleView({ contacts, companies, contactRoles }: PeopleViewProps) {
  void contactRoles
  const [search, setSearch] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  // Helper: look up company name
  const companyMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of companies) {
      map.set(c.id, c.name)
    }
    return map
  }, [companies])

  const getCompanyName = (contact: Contact) => {
    if (!contact.companyId) return undefined
    return companyMap.get(contact.companyId)
  }

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return contacts
    const q = search.toLowerCase()
    return contacts.filter((contact) => {
      if (contact.fullName.toLowerCase().includes(q)) return true
      if (contact.email?.toLowerCase().includes(q)) return true
      if (contact.title?.toLowerCase().includes(q)) return true
      const cName = contact.companyId ? companyMap.get(contact.companyId) : undefined
      if (cName?.toLowerCase().includes(q)) return true
      return false
    })
  }, [contacts, search, companyMap])

  // Group by company
  const groups = useMemo(() => {
    const map = new Map<string, { companyName: string; contacts: Contact[] }>()

    for (const contact of filtered) {
      const key = contact.companyId ?? '__none__'
      const companyName = contact.companyId
        ? companyMap.get(contact.companyId) ?? 'Unknown Company'
        : 'No Company'
      if (!map.has(key)) {
        map.set(key, { companyName, contacts: [] })
      }
      map.get(key)!.contacts.push(contact)
    }

    return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }))
  }, [filtered, companyMap])

  if (contacts.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
        <PageHeader title="People" />
        <EmptyState
          title="No contacts yet"
          description="Add contacts to manage your project people and company relationships."
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="People">
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
          {filtered.length} of {contacts.length} contacts
        </span>
      </PageHeader>

      {/* Search bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          placeholder="Search people..."
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
            <CompanyGroup
              key={group.key}
              companyName={group.companyName}
              contacts={group.contacts}
              companies={companies}
              onSelectContact={setSelectedContact}
            />
          ))}
        </div>
      )}

      {/* Side panel */}
      <SidePanel
        open={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        title={selectedContact?.fullName ?? ''}
      >
        {selectedContact && (
          <ContactDetail
            contact={selectedContact}
            companyName={getCompanyName(selectedContact)}
          />
        )}
      </SidePanel>
    </div>
  )
}
