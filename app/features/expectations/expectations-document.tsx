'use client'

import type { ProjectExpectation, ExpectationCategory } from '@/types/database'

// ─── Constants ───────────────────────────────────────────────

const SECTION_CONFIG: {
  title: string
  categories: ExpectationCategory[]
}[] = [
  {
    title: 'General Expectations',
    categories: ['general', 'communication', 'site_conditions'],
  },
  {
    title: 'Preparation & Coordination',
    categories: ['preparation_coordination'],
  },
  {
    title: 'Quality Standards',
    categories: ['quality_standards'],
  },
]

// ─── Props ───────────────────────────────────────────────────

interface ExpectationsDocumentProps {
  projectName: string
  projectExpectations: ProjectExpectation[]
}

// ─── Component ───────────────────────────────────────────────

export function ExpectationsDocument({
  projectName,
  projectExpectations,
}: ExpectationsDocumentProps) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Build sections
  const sections = SECTION_CONFIG.map(config => ({
    title: config.title,
    items: projectExpectations.filter(
      pe => pe.expectation && config.categories.includes(pe.expectation.category)
    ),
  })).filter(s => s.items.length > 0)

  return (
    <div
      className="expectations-document"
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '60px 40px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#1a1a1a',
        lineHeight: 1.7,
      }}
    >
      {/* Print button — hidden in print */}
      <div className="no-print" style={{ marginBottom: 'var(--space-4)', textAlign: 'right' }}>
        <button
          onClick={() => window.print()}
          className="text-sm font-medium"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Print / Save PDF
        </button>
      </div>

      {/* Header */}
      <header style={{ marginBottom: 48, borderBottom: '2px solid #1a1a1a', paddingBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
          Trade Expectations
        </h1>
        <p style={{ fontSize: 16, margin: '8px 0 0', color: '#555' }}>
          {projectName}
        </p>
        <p style={{ fontSize: 13, margin: '4px 0 0', color: '#888' }}>
          {today}
        </p>
      </header>

      {/* Purpose */}
      <section style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 15, color: '#333' }}>
          This document describes the behavioral standards and operational expectations for all trades
          working on this project. These expectations are based on field experience and apply to how
          work is performed, coordinated, and quality-checked. They are separate from the technical
          scope of work and are intended to be reviewed and acknowledged by every trade before
          mobilizing to the site.
        </p>
      </section>

      {/* Sections */}
      {sections.map((section, sIdx) => (
        <section key={sIdx} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
            {section.title}
          </h2>
          <ol style={{ paddingLeft: 24, margin: 0 }}>
            {section.items.map((pe) => {
              const text = pe.customText || pe.expectation?.description || ''
              return (
                <li key={pe.id} style={{ fontSize: 14, marginBottom: 10, paddingLeft: 4 }}>
                  {text}
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      {/* Footer */}
      <footer style={{ marginTop: 48, borderTop: '1px solid #ddd', paddingTop: 16, fontSize: 12, color: '#999' }}>
        <p>
          Generated from the project expectations library. Items may be customized per project.
        </p>
      </footer>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .expectations-document {
            padding: 0 !important;
            max-width: none !important;
          }
          body { margin: 0; }
          @page {
            margin: 1in;
            size: letter;
          }
        }
      `}</style>
    </div>
  )
}
