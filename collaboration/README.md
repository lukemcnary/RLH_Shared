# Collaboration

> Status: Authoritative

This document explains how Luke and Trevor should use this repo to stay aligned while building one product together.

---

## Purpose

The collaboration docs exist to make shared decision-making visible without turning this repo into a backfilled history of every solo design choice that happened before joint work began.

The root docs should stay high-level and point into this folder when the task is specifically about onboarding, sandbox workflow, or shared Luke-and-Trevor decisions.

They are for:

- active alignment between Luke and Trevor
- open product, architecture, workflow, and compatibility questions
- a concise record of decisions the two of you actually close together going forward

They are not for:

- reconstructing all earlier Luke-only or Trevor-only decisions after the fact
- duplicating what is already clear in the current authoritative docs
- logging routine edits that do not create a meaningful shared decision

---

## Collaboration Docs

- `DECISIONS_OPEN.md` — unresolved shared decisions that still need alignment
- `DECISIONS_CLOSED.md` — decisions Luke and Trevor have explicitly closed together in this repo going forward

The core product docs in `reference/` still define the product itself.

These collaboration docs exist to capture the decision state around that product:

- what still needs to be decided
- what was actually decided together
- what should no longer live only in side conversations or memory

---

## What Belongs In The Open List

Use the open list when a question:

- affects the shared target model
- changes compatibility posture or ownership boundaries
- changes contributor workflow or repo rules
- blocks implementation because Luke and Trevor need to choose a direction
- is important enough that leaving it implicit will create drift

Each open item should make it easy to see:

- what needs to be decided
- why it matters
- which docs, tables, routes, or workflows are affected
- what the next step is

---

## What Belongs In The Closed Log

Use the closed log when Luke and Trevor have actually aligned on a decision and the relevant docs have been updated to match.

The closed log should stay concise. It is not meant to replace the source-of-truth docs. It is meant to preserve the collaboration-level summary:

- what was decided
- why
- what it affects

---

## Working Pattern

1. Add an item to `DECISIONS_OPEN.md` when a meaningful shared decision is still unresolved.
2. Update the relevant source-of-truth docs once the decision is made.
3. Move a concise summary into `DECISIONS_CLOSED.md`.
4. Remove or clearly mark the open item as resolved in the same pass.

If a session resolves a meaningful shared decision immediately, it can go straight into the closed log as long as the authoritative docs are updated in the same change.

---

## Templates

### Open decision

```md
## [YYYY-MM-DD] — [Short title]

**Status:** Open
**Owners:** Luke, Trevor
**Decision to make:** What needs to be decided.
**Why it matters:** Why this needs shared alignment.
**Affected docs/surfaces:** Files, tables, routes, or workflows involved.
**Next step:** What should happen next.
```

### Closed decision

```md
## [YYYY-MM-DD] — [Short title]

**Decision:** What was decided.
**Rationale:** Why this was the right call.
**Affects:** Which docs, workflows, or implementation surfaces should reflect it.
```
