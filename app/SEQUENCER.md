# Shared App — Sequencer Implementation

> Status: Authoritative

This document explains how the sequencer is implemented in the checked-in shared app. It is the execution-feature companion to `reference/SYSTEM_ARCHITECTURE.md`.

Important boundary:

- this doc describes the **current checked-in implementation**
- the core reference docs describe the **target shared architecture**
- the current sequencer still uses Trevor compatibility surfaces such as `cr6cd_buildphases`, `rlh_projecttrades`, `rlh_tradeitems`, and `cr6cd_mobilizationmarkerses`
- the target shared model groups action items into mobilizations; it does not treat project scope as direct mobilization contents
- the current source-of-truth map for the sequencer is documented in `app/SEQUENCER_BACKEND_MAP.md`

---

## Current Surface

- Route: `/projects/[id]/sequencer`
- Parent layout: `app/projects/[id]/layout.tsx`
- Sidebar grouping: `Project`, `Development`, `Execution`, and `Admin`, rendered by `features/projects/project-tabs.tsx`
- Related execution route: `/projects/[id]/tasks`

The sequencer page is a thin server component. It calls `getSequencerPageData(id)` from `lib/dataverse/adapter.ts` and renders `features/sequencer/sequencer-board.tsx`.

---

## Data Contract Used By The Page

The page now carries two related bundles:

- `data`
  - `project`
  - `gates`
  - `projectTrades`
  - `mobilizations`
- `executionData`
  - `project`
  - `gates`
  - `projectTrades`
  - `mobilizations`
  - `tradeScopes`

Important rule:

- `data` is the compatibility-shaped read bundle used by the current modal/edit flow
- `executionData` is the canonical engine input used by `features/sequencer/projector.ts`
- in `executionData`, mobilization compatibility step blobs are intentionally stripped before projection so runtime steps come from `tradeScopes`

Those domain objects come from `types/database.ts`. UI code does not consume raw Dataverse field names.

---

## Dataverse Reads In Live Mode

The checked-in query layer currently reads from these entity sets:

| Domain object | Query file | Entity set |
|---|---|---|
| Project | `queries/projects.ts` | `cr6cd_projects` |
| Gate | `queries/gates.ts` | `cr6cd_buildphases` |
| Project trade | `queries/project-trades.ts` | `rlh_projecttrades` |
| Mobilization | `queries/mobilizations.ts` | `cr6cd_mobilizations` |
| Trade scope linkage | `queries/trade-scopes.ts` | `rlh_tradescopes` |
| Compatibility step bridge | `queries/mobilizations.ts` | `rlh_tradeitems` |
| Compatibility marker bridge | `queries/mobilizations.ts` | `cr6cd_mobilizationmarkerses` |
| Action-item list route | `queries/tasks.ts` | `rlh_tasks` |

Trade metadata is expanded through the project-trade query path and ultimately comes from `cr6cd_trades`.

Current important nuance:

- mobilization rows still include compatibility fields such as `cr6cd_stepsjson` and `cr6cd_markersjson`
- the raw sequencer bundle still carries those values for edit parity
- when legacy child trade-item or marker rows exist, the compatibility read bundle uses them first and falls back to embedded JSON when needed
- the sequencing engine does **not** treat embedded step JSON as authoritative; it derives runtime steps from `tradeScopes`

---

## Data Flow

1. The route page imports from `lib/dataverse/adapter.ts`.
2. The adapter chooses `mock` or `live` mode based on `DATAVERSE_MODE`.
3. In `mock` mode, data comes from `lib/mock-data.ts`.
4. In `live` mode, query files in `lib/dataverse/queries/` transform OData responses into clean domain types.
5. The adapter returns both `data` and `executionData`.
6. `SequencerBoard` uses `data` for the current edit/save surface and `executionData` for the sequencing engine.
7. `buildSequence()` delegates to `features/sequencer/projector.ts`, which derives steps and resolved layout from `tradeScopes`.

The layout keeps the sidebar fixed while the sequencer manages its own workspace scrolling inside the main content area.

---

## Mutations

Sequencer writes live in `features/sequencer/actions.ts`.

Current server actions:

- `createMobilization`
- `updateMobilization`
- `deleteMobilization`
- `updateGate`

Current write behavior:

- `mock` mode performs no persistent writes and only revalidates the route
- `live` mode writes directly through `dvFetch()`
- compatibility step and marker JSON are still emitted during updates as a Trevor bridge
- legacy `rlh_tradeitems` and `cr6cd_mobilizationmarkerses` rows are also rewritten as a temporary Trevor bridge
- trade items and mobilization markers are replaced wholesale during updates instead of diffed record-by-record

Entity sets used by the write path:

- `cr6cd_mobilizations`
- `cr6cd_buildphases`
- `rlh_projecttrades`
- `rlh_tradeitems`
- `cr6cd_mobilizationmarkerses`

---

## Live Mode Requirements

Live Dataverse mode requires these environment variables in `.env.local`:

```env
DATAVERSE_MODE=live
DATAVERSE_URL=https://yourorg.crm.dynamics.com
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

`lib/dataverse/client.ts` handles Azure client-credentials auth and caches the bearer token in memory for reuse.

---

## Current Boundaries

- The sequencer is implemented and routed as part of the shared app.
- Action items are a separate peer project view backed by `rlh_tasks`.
- The current checked-in board derives runtime sequencing steps from `tradeScopes`, not from embedded mobilization step JSON.
- The current edit/save surface still carries compatibility step and marker data so Trevor parity can continue while the closed source-of-truth decision is enforced.
- Change orders exist as a placeholder project route today. RFIs remain part of the target shared architecture but are not a full checked-in project route yet.
- Files now live at the project level as `/projects/[id]/files` rather than under an execution-only route.
- If Dataverse metadata changes, update the query and action files first, then update this doc to match.
