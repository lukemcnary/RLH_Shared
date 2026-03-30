# Shared App

> Status: Authoritative

`app/` is the checked-in Next.js implementation of the combined product. It keeps Dataverse as the system of record, uses SharePoint for file handling, and presents project work through flat peer routes under each project.

Read `app/LOCAL_SETUP.md` first if you are trying to run the app.

Important boundary:

- the core shared reference docs describe the target shared architecture
- this app currently includes some compatibility reads and writes against existing Dataverse execution tables that Trevor's app also uses, but it is not integrated with Trevor's app itself
- this checked-in app currently uses a server-side Dataverse client for live mode; the target identity and permission posture is documented in `reference/PERMISSIONS.md`

---

## What Lives Here

- `app/` — App Router pages and layouts
- `components/` — shared UI primitives
- `features/` — feature views and server actions
- `lib/dataverse/` — Dataverse auth, queries, and the public adapter
- `lib/sharepoint/` — SharePoint/Graph auth, library config, and project file orchestration
- `lib/mock-data.ts` — default development data when `DATAVERSE_MODE=mock`
- `types/database.ts` — clean domain types used above the Dataverse layer

---

## Current Route Surface

- `/projects` — project list
- `/projects/[id]` — project home / dashboard
- `/projects/[id]/budget`, `/cost-items`, `/scope-items`, `/bid-packages`, `/expectations`
- `/projects/[id]/sequencer` — sequencer board
- `/projects/[id]/tasks` — action-item list
- `/projects/[id]/files` — project-level files hub
- `/projects/[id]/estimate`, `/communication`, `/change-orders` — placeholder or scaffolded
- `/leads`, `/contacts`, `/files`, `/messages` — top-level reference or utility views

---

## Data Layer Rules

- Server components fetch through `lib/dataverse/adapter.ts`, not by importing query files directly.
- `DATAVERSE_MODE=mock` is the default local mode. It reads from `lib/mock-data.ts`.
- `DATAVERSE_MODE=live` uses Azure credentials and OData calls through `lib/dataverse/client.ts`.
- SharePoint file access uses the same Azure app identity through `lib/sharepoint/client.ts`.
- No browser or server route in this app calls Trevor's app. Live mode talks directly to Dataverse.
- Dataverse field names stay inside `lib/dataverse/`. UI code receives only clean domain types.
- Writes happen in feature-level server actions and must call `revalidatePath()` after successful mutation.
- Microsoft-backed sign-in and permission enforcement remain part of the target shared architecture even when the app uses server-side Dataverse access.

---

## Read Alongside

- `app/LOCAL_SETUP.md`
- `reference/SYSTEM_ARCHITECTURE.md`
- `reference/PERMISSIONS.md`
- `reference/SCHEMA_PLAN.md`
- `app/SEQUENCER.md`
