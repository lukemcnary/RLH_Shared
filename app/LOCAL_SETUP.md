# Local Setup

> Status: Authoritative

This guide is the day-1 setup path for running the shared app locally.

The recommended first run is **mock mode**. It does not require live Dataverse credentials.

---

## Prerequisites

- a current Node.js LTS install
- `npm`

---

## Mock Mode Setup

1. Open a terminal in the app folder.

```bash
cd app
```

2. Install dependencies.

```bash
npm install
```

3. Create a local env file if you want the mode to be explicit.

```bash
cp .env.local.example .env.local
```

If you skip this file, the app still defaults to mock mode.

4. Start the dev server.

```bash
npm run dev
```

5. Open the app in your browser.

```text
http://localhost:3000/projects
```

---

## Best First Routes

Use the built-in mock project `proj-001`.

- `/projects`
- `/projects/proj-001`
- `/projects/proj-001/scope-items`
- `/projects/proj-001/bid-packages`
- `/projects/proj-001/sequencer`
- `/projects/proj-001/files`

Those routes give the fastest overview of the flat peer-route project model and the current shared UI shape.

---

## What Works Today

Implemented surfaces:

- project list
- project-level layout, home dashboard, and sidebar groupings
- peer project routes for budget, cost items, project scope, bid packages, expectations, sequencer, action items, and files
- project-level files hub with SharePoint-aware browse/upload structure
- top-level leads, contacts, files, and messages views

Still placeholder or scaffolded:

- `/projects/[id]/estimate`
- `/projects/[id]/communication`
- `/projects/[id]/change-orders`

---

## Mock Mode Behavior

- mock mode is controlled by `DATAVERSE_MODE=mock`
- reads come from `lib/mock-data.ts`
- sequencer actions do not persist changes outside the current dev session
- mock mode is the recommended starting point for adoption, design review, and most UI work

---

## Live Dataverse Later

Live mode is available when needed, but it is **not** part of the day-1 setup bar.

When you are ready for live mode, put these values in `.env.local`:

```env
DATAVERSE_MODE=live
DATAVERSE_URL=https://yourorg.crm.dynamics.com
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

Current important note:

- the checked-in app uses a server-side Dataverse client for live mode
- the same Azure app identity must also have Microsoft Graph permissions if you want live SharePoint-backed files
- the target Microsoft sign-in and permission posture is described in `reference/PERMISSIONS.md`

---

## Read Next

- `README.md`
- `collaboration/ONBOARDING.md`
- `app/README.md`
- `reference/COMPATIBILITY_MAP.md`
- `reference/SYSTEM_ARCHITECTURE.md`
