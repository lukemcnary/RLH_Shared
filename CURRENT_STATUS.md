# Current Status

> Status: Authoritative

This file is a compact snapshot of the combined product as it exists in this repo today.

---

## Product State

This repo is the active documentation and implementation home for the Microsoft-backed combined product.

Current milestone:

- **GitHub-ready shared foundation** — the repo should present one coherent product voice, one coherent target model, and one coherent implementation story before broader rollout.

The current source-of-truth docs describe a **scope-first product with explicit execution structure on Dataverse and SharePoint**:

- Trevor and Luke are intended to build **one shared app**
- Development is **scope-first**
- project scope is the **planning center**
- project scope is the **canonical bridge from development into preparation and execution**
- cost items become the **financial control center once created**
- action items are the **execution records grouped into mobilizations**
- major product records stay **flat peers under the project**
- gates are **explicit mobilization classification**
- Microsoft remains the authority for identity and permission intent
- the app displays, enforces, and normalizes backend truth rather than inventing it
- Trevor's older build-phase, marker, step, prep, and trade-detail structures are **compatibility surfaces**, not the desired long-term architecture

---

## App State

The checked-in app under `app/` currently includes:

- a project list, project-level sidebar layout, and project home dashboard
- implemented peer project routes for budget, cost items, project scope, bid packages, sequencer, action items, expectations, and files
- a current sidebar model that separates Development, Preparation, Execution, and Financial views, with `Project Scope` intentionally surfaced as the bridge between Development and Preparation
- an implemented project-level files hub that browses SharePoint libraries and registers optional Dataverse file metadata
- placeholder or scaffolded peer project routes for estimate, communication, and change orders
- a Dataverse adapter layer with `mock` mode as the default and `live` mode behind Azure credentials
- server actions for sequencer mutations against Trevor's current execution tables, project-level file actions, and expectations actions
- no user-facing Microsoft sign-in layer is documented in the checked-in app yet; the target permission posture is documented separately in `reference/PERMISSIONS.md`

Important current-state notes:

- the live sequencer still reads a few existing Dataverse execution surfaces such as `cr6cd_buildphases`, `rlh_projecttrades`, `rlh_tradeitems`, and `cr6cd_mobilizationmarkerses` directly from Dataverse; it does not call Trevor's app
- the new files hub is also a direct platform client: SharePoint is authoritative for file bytes and Dataverse stores lightweight file references and record links
- the core reference docs describe the **target shared architecture**, not just the current app's bridge shape
- the app still contains bridge behavior, but the product definition is now intentionally product-first rather than adoption-first
- day-1 contribution is intentionally centered on mock mode, not live Dataverse setup

---

## Documentation State

Current authoritative docs:

- `README.md`
- `CURRENT_STATUS.md`
- `TREVOR_START.md`
- `CONTRIBUTING.md`
- `collaboration/README.md`
- `collaboration/ONBOARDING.md`
- `collaboration/GITHUB_SANDBOX_WORKFLOW.md`
- `PROJECT_CONTEXT.md`
- `reference/PRODUCT_VISION.md`
- `reference/COMPATIBILITY_MAP.md`
- `reference/DOMAIN_MODEL.md`
- `reference/DATA_FLOW.md`
- `reference/SCHEMA_PLAN.md`
- `reference/SYSTEM_ARCHITECTURE.md`
- `reference/PERMISSIONS.md`
- `reference/AI_STRATEGY.md`
- `reference/DATA_CONVENTIONS.md`
- `reference/SYSTEM_DIAGRAM.md`
- `reference/WORKFLOW_RULES.md`
- `workflows/project-setup.md`
- `workflows/scope-and-cost.md`
- `workflows/bidding.md`
- `workflows/selections.md`
- `workflows/sequencing.md`
- `workflows/execution.md`
- `workflows/transition.md`
- `workflows/files.md`
- `workflows/expectations.md`
- `skills/new-session.md`
- `skills/trevor-orientation.md`
- `skills/close-session.md`
- `skills/new-feature.md`
- `skills/schema-change.md`
- `skills/doc-sync.md`
- `skills/compatibility-change.md`
- `app/README.md`
- `app/LOCAL_SETUP.md`
- `app/SEQUENCER.md`
- `collaboration/DECISIONS_OPEN.md`
- `collaboration/DECISIONS_CLOSED.md`

Current draft docs:

- `reference/DOMAIN_GLOSSARY.md`
- `reference/UI_DESIGN.md`
- `workflows/project-closeout.md`

---

## Immediate Reading Path

If you are starting work in this repo, read:

1. `PROJECT_CONTEXT.md`
2. `TREVOR_START.md` if you want the shortest Trevor-first orientation
3. `reference/PRODUCT_VISION.md`
4. `reference/COMPATIBILITY_MAP.md`
5. `reference/DOMAIN_MODEL.md`
6. `reference/DATA_FLOW.md`
7. `reference/SCHEMA_PLAN.md`
8. `reference/SYSTEM_ARCHITECTURE.md`
9. `reference/PERMISSIONS.md`
10. `reference/AI_STRATEGY.md`
11. `app/LOCAL_SETUP.md`

If you are contributing from your own sandbox or need GitHub instructions for branch and pull-request flow, read `collaboration/GITHUB_SANDBOX_WORKFLOW.md` next.

If you are touching the current sequencer implementation, then read `app/SEQUENCER.md` after the docs above so you understand where the checked-in app still uses compatibility tables.

If the work opens or closes a meaningful Luke-and-Trevor decision, also read `collaboration/README.md`.
