# Workflow: Expectations

> Status: Authoritative

This workflow describes how the team creates, manages, and applies trade expectations across projects.

Expectations are short, actionable behavioral standards that tell trades how to operate — not what to build (scope) or what to know (knowledge entries). They prevent known issues, clarify assumptions, and improve coordination.

---

## Outcome

By the end of this workflow:

- the org-level expectations library contains clear, categorized behavioral standards
- each project has a curated set of expectations selected from the library
- the PM has reviewed, adjusted wording, and ordered the expectations for that project
- a formatted expectations document is ready to share with trades
- project guidance is clearer without confusing expectations with scope or execution structure

---

## Steps

### 1. Build the org-level expectations library

Create expectations in the master library. Each expectation should:

- be 1-2 sentences, clear and direct
- belong to exactly one category: General, Communication, Site Conditions, Preparation & Coordination, or Quality Standards
- be optionally scoped to a trade type (if not set, it applies to all trades)
- avoid vague language — every expectation should be enforceable

Good example: "Do not proceed if what you're building on isn't correct or complete. Raise it before continuing."

Bad example: "Ensure proper coordination with other trades as required."

The library evolves over time. When a field issue occurs due to a missed expectation, add a new one.

### 2. Assign trades to the project

Use the existing project-trade junction to define which trades are involved. This determines which trade-specific expectations will apply.

### 3. Auto-populate project expectations

When trades are assigned, the system pulls in:

- all active general expectations (no trade type set)
- all active expectations for the assigned trade types

These create project expectation rows with source = Auto.

### 4. Review and curate

At the project level, the PM should:

- remove expectations that do not apply to this job
- override wording where the project context requires different language
- reorder expectations within each category for the document
- add expectations manually from the library if the auto-population missed any

### 5. Generate the expectations document

The system compiles the included expectations into a formatted document:

1. **Purpose** — static intro explaining what the document is
2. **General Expectations** — expectations categorized as General, Communication, or Site Conditions
3. **Preparation & Coordination** — expectations in that category
4. **Quality Standards** — expectations in that category

The document should be concise (1-2 pages), clean, and easy to scan. It uses custom text where set, falling back to the master description.

The document is viewable in the app and printable via the browser. PDF export can layer on top later.

---

## Done When

- trades receive a clear, concise document that sets behavioral expectations before work begins
- the PM can trace every expectation back to the org library
- new field issues can feed back into the library for future projects
- the expectations layer strengthens the project model without replacing scope, files, or explicit execution structure

---

## Long-Term Vision

This system becomes a feedback loop:

1. Issue occurs in the field
2. Root cause is identified as a missed expectation
3. New expectation is created in the library
4. Future projects automatically inherit the improvement

Over time, this builds a structured knowledge base of trade-specific coordination patterns, quality standards, and operational insights.
