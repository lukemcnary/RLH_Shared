'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PROJECT_ROUTE_GROUPS, PROJECT_DIRECT_LINKS, projectHref } from './routes'

interface ProjectTabsProps {
  projectId: string
}

const PRIMARY_GROUP_BY_PATH = PROJECT_ROUTE_GROUPS.reduce<Map<string, string>>((map, group) => {
  for (const tab of group.tabs) {
    if (!map.has(tab.path)) {
      map.set(tab.path, group.label)
    }
  }
  return map
}, new Map())

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname()

  // Bridge routes may appear in multiple groups, but only the first owner auto-expands as active.
  const autoExpanded = new Set(
    PROJECT_ROUTE_GROUPS
      .filter(group =>
        group.tabs.some(
          tab =>
            pathname === projectHref(projectId, tab.path) &&
            PRIMARY_GROUP_BY_PATH.get(tab.path) === group.label
        )
      )
      .map(group => group.label)
  )

  const [expanded, setExpanded] = useState<Set<string>>(autoExpanded)

  function toggleGroup(label: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  // Shared style for top-level items (groups + direct links)
  const topLevelStyle: React.CSSProperties = {
    padding: '7px 10px',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    textDecoration: 'none',
    display: 'block',
  }

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {/* Collapsible route groups */}
      {PROJECT_ROUTE_GROUPS.map((group) => {
        const isExpanded = expanded.has(group.label)

        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              style={{
                ...topLevelStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                border: 'none',
                background: 'none',
                color: 'var(--sidebar-text)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
              className="project-tab"
            >
              {group.label}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms ease',
                  opacity: 0.35,
                  flexShrink: 0,
                }}
              >
                <path
                  d="M3.5 2l3.5 3-3.5 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                marginTop: '2px',
                marginBottom: '4px',
                marginLeft: '10px',
                paddingLeft: '10px',
                borderLeft: '1px solid var(--border-light)',
              }}>
                {group.tabs.map((tab) => {
                  const href = projectHref(projectId, tab.path)
                  const isActive =
                    pathname === href && PRIMARY_GROUP_BY_PATH.get(tab.path) === group.label
                  return (
                    <Link
                      key={tab.path}
                      href={href}
                      className="project-tab"
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--sidebar-text-muted)',
                        fontWeight: isActive ? 500 : 400,
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isActive ? 'var(--accent-light)' : undefined,
                        textDecoration: 'none',
                        display: 'block',
                        fontSize: 12,
                      }}
                    >
                      {tab.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Direct links: Communication, Files */}
      {PROJECT_DIRECT_LINKS.map((link) => {
        const href = projectHref(projectId, link.path)
        const isActive = pathname === href
        return (
          <Link
            key={link.path}
            href={href}
            className="project-tab"
            style={{
              ...topLevelStyle,
              color: isActive ? 'var(--accent)' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'var(--accent-light)' : undefined,
            }}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
