# Shared App — Sequencer Implementation

> Status: Authoritative

This document explains how the sequencer is implemented in the checked-in shared app. It is the execution-feature companion to `reference/SYSTEM_ARCHITECTURE.md`.

Important boundary:

- this doc describes the **current checked-in implementation**
- the core reference docs describe the **target shared architecture**
- the current sequencer still uses Trevor compatibility surfaces such as `cr6cd_buildphases`, `rlh_projecttrades`, `rlh_tradeitems`, and `cr6cd_mobilizationmarkerses`
- the target shared model groups action items into mobilizations; it does not treat project scope as direct mobilization contents

---

## Current Surface

- Route: `/projects/[id]/sequencer`
- Parent layout: `app/projects/[id]/layout.tsx`
- Sidebar grouping: `Project`, `Development`, `Execution`, and `Admin`, rendered by `features/projects/project-tabs.tsx`
- Related execution route: `/projects/[id]/tasks`

The sequencer page is a thin server component. It calls `getSequencerData(id)` from `lib/dataverse/adapter.ts` and renders `features/sequencer/sequencer-board.tsx`.

---

## Data Contract Used By The Page

`getSequencerData(projectId)` returns:

- `project`
- `gates`
- `projectTrades`
- `mobilizations`

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
| Mobilization steps | `queries/mobilizations.ts` | `rlh_tradeitems` |
| Mobilization markers | `queries/mobilizations.ts` | `cr6cd_mobilizationmarkerses` |
| Action-item list route | `queries/tasks.ts` | `rlh_tasks` |

Trade metadata is expanded through the project-trade query path and ultimately comes from `cr6cd_trades`.

---

## Data Flow

1. The route page imports from `lib/dataverse/adapter.ts`.
2. The adapter chooses `mock` or `live` mode based on `DATAVERSE_MODE`.
3. In `mock` mode, data comes from `lib/mock-data.ts`.
4. In `live` mode, query files in `lib/dataverse/queries/` transform OData responses into clean domain types.
5. `SequencerBoard` receives fully-shaped props and manages only UI state.

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
- The target shared model expects sequencer work to be represented as action items assigned to mobilizations, but the current checked-in board still reads legacy trade items and markers for much of that execution detail.
- Change orders exist as a placeholder project route today. RFIs remain part of the target shared architecture but are not a full checked-in project route yet.
- Files now live at the project level as `/projects/[id]/files` rather than under an execution-only route.
- If Dataverse metadata changes, update the query and action files first, then update this doc to match.
