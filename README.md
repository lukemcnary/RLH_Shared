# Shared Repo

> Status: Authoritative

This repo is the documentation and implementation home for the combined Rangeline product on Microsoft infrastructure.

It carries forward Luke's scope-first product thinking, Trevor's execution and platform discipline, and the shared model the team now wants to build together.

The shared product is not a comparison notebook and it is not a wrapper around Trevor's app. It is one co-owned product with one active source of truth: this repo's authoritative docs and checked-in app.

The point of this repo is to give Trevor and Luke one app and one product model to build together instead of splitting planning/commercial work and execution work across separate products.

---

## Start Here

1. `CURRENT_STATUS.md`
2. `PROJECT_CONTEXT.md`
3. `reference/PRODUCT_VISION.md`
4. `reference/COMPATIBILITY_MAP.md`
5. `reference/DOMAIN_MODEL.md`
6. `reference/DATA_FLOW.md`
7. `reference/SCHEMA_PLAN.md`
8. `reference/SYSTEM_ARCHITECTURE.md`
9. `reference/PERMISSIONS.md`
10. `reference/AI_STRATEGY.md`
11. `app/LOCAL_SETUP.md`

If you are Trevor or a new contributor, also read `collaboration/ONBOARDING.md` after the list above for a hands-on adoption path.

If you are contributing from your own sandbox or asking Claude/Codex for Git and pull-request instructions, read `collaboration/GITHUB_SANDBOX_WORKFLOW.md` right after `collaboration/ONBOARDING.md`.

If you are Trevor and want the shortest product-first explanation before diving into the full docs, read `TREVOR_START.md` right after `CURRENT_STATUS.md`.

If you are Luke or Trevor and are working through a live shared decision, read `collaboration/README.md` alongside the core docs above.

---

## Product Posture

- **Current app:** the checked-in Next.js app under `app/` runs in mock mode today and already demonstrates the shared project model.
- **One combined app:** the checked-in app is intended to become the shared home for planning, commercial work, execution coordination, files, and future assistive tooling.
- **Current bridge:** the live sequencer still reads and writes some existing Dataverse execution tables that Trevor's app also uses. That is table overlap, not app-to-app integration.
- **Target architecture:** the `reference/` docs define the long-term shared model on Dataverse and SharePoint with Microsoft-backed identity and permissions.
- **Outside source material:** Luke and Trevor source material outside this repo remains valuable context, but the shared product is defined here once an authoritative doc says otherwise.

---

## Repo Layout

- `app/` — the checked-in Next.js app
- `reference/` — source-of-truth product, data-flow, schema, architecture, and permissions docs
- `workflows/` — PM-facing operational workflows
- `skills/` — AI operating procedures for recurring work in this repo
- `collaboration/` — onboarding, sandbox workflow, and open/closed decision tracking for Luke-and-Trevor collaboration

---

## Source Of Truth

Core docs in reading order:

- `CURRENT_STATUS.md`
- `PROJECT_CONTEXT.md`
- `reference/PRODUCT_VISION.md`
- `reference/COMPATIBILITY_MAP.md`
- `reference/DOMAIN_MODEL.md`
- `reference/DATA_FLOW.md`
- `reference/SCHEMA_PLAN.md`
- `reference/SYSTEM_ARCHITECTURE.md`
- `reference/PERMISSIONS.md`
- `reference/AI_STRATEGY.md`

Implementation and workflow docs:

- `app/README.md`
- `app/LOCAL_SETUP.md`
- `app/SEQUENCER.md`
- `collaboration/README.md`
- `collaboration/ONBOARDING.md`
- `collaboration/GITHUB_SANDBOX_WORKFLOW.md`
- `CONTRIBUTING.md`
- the relevant doc in `workflows/`

AI operating docs:

- the relevant doc in `skills/`

Draft docs still exist, but they are not the first-day path.

---

## Working Rules

- Update the relevant source-of-truth doc in the same session as any product, workflow, or schema change.
- Record unresolved shared decisions in `collaboration/DECISIONS_OPEN.md` and move them to `collaboration/DECISIONS_CLOSED.md` once they are closed.
- Classify changes clearly as `target-model`, `bridge-only`, or `documentation-only`.
- Treat Trevor's current Dataverse structures as compatibility inputs unless an authoritative shared doc explicitly keeps them in the target model.
- Treat outside source material as context, not as authority for the shared product once this repo says otherwise.
- Keep Microsoft as the authority for identity and permission intent, Dataverse as the authority for business records, and SharePoint as the authority for files.
