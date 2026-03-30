# Workflow: Adopting the Shared App on Dataverse

> Status: Authoritative

This workflow documents how the team adopts the shared app in a Dataverse environment that may already be used by Trevor's current app.

The important boundary is simple:

- the shared app is completely new
- it is not connected to Trevor's app
- it does not need data imported from Trevor's app in order to function
- it only needs the correct Dataverse tables, SharePoint boundaries, and Microsoft-backed auth setup

The strategy is **additive and project-by-project**. Trevor's app may stay live while the shared app proves itself, but that is an operational choice, not a technical dependency.

---

## Current State

**Trevor's app (live today)**

- Vanilla HTML/JS hosted on Azure Static Web Apps
- MSAL browser-direct authentication to Dataverse
- Deployed via PowerShell scripts (promote → preview → deploy)
- Owns the sequencer board, mobilizations, gates, markers, and trade-item execution
- Users access it at a URL, sign in with Microsoft, and work directly against Dataverse

**Shared app (in development)**

- Next.js with server-side Dataverse access
- Mock mode by default, live mode with Azure service credentials
- No deployment infrastructure yet, no user-facing sign-in yet
- Owns the shared planning/commercial direction and already includes checked-in routes for budget, cost items, project scope, bid packages, expectations, sequencer, action items, and the project-level files hub
- Scope details and selections remain part of the target shared model, but they are not full checked-in project routes yet
- Currently reads some existing Dataverse compatibility tables through an adapter layer

**Both apps are independent clients of the same Dataverse environment.** The shared app does not call Trevor's app, wrap Trevor's app, or rely on Trevor's runtime in any way.

### Why the shared app is the better long-term app surface

- Trevor and Luke need to build the same product, not adjacent apps.
- The shared product already spans planning, pricing, sequencing, action items, files, and expectations.
- A React/Next.js app is a better fit for a product that needs stronger UI quality, more reusable components, cleaner routing, and better long-term maintainability.
- Server-side reads, writes, and permission enforcement are easier to reason about than a larger product built around browser-direct Dataverse calls.
- The checked-in app already has the beginnings of that structure, so it is a better home for the combined product direction.
- This should improve the sequencer rather than bury it: the board stays first-class, but gains a better implementation environment and better connections to the rest of the project model.

---

## Transition Strategy

The transition is **additive, not a big-bang cutover**.

What that means:

- Trevor's app may stay live while the team adopts the shared app
- New shared target tables get created in Dataverse alongside existing ones
- The shared app connects directly to the Dataverse tables it needs
- If an existing project has little useful data in Trevor-style tables, the preferred path is to recreate the needed project records directly in the shared model
- Historical carryover is optional, not a requirement
- No app-to-app bridge or two-way sync is required

---

## Prerequisites Before First Real Project

The shared app must meet these conditions before it can accept a real project.

### Deployment and hosting

- The shared app is deployed to an Azure hosting service (Azure Static Web Apps with Node.js runtime, or Azure App Service)
- A CI/CD pipeline exists for build, preview, and production deployment
- Environment variables are managed securely for live Dataverse credentials
- The deployment workflow follows the same promote → preview → production pattern Trevor already uses

### Identity and permissions

- Microsoft sign-in is integrated so users authenticate with their org accounts
- Server-side permission enforcement runs before data is returned or mutated
- Acting-user audit stamping exists on important writes
- The permission model follows the boundary rules in `reference/PERMISSIONS.md`

### Feature completeness

The minimum set before a real project can use the shared app:

| Feature area | Required state |
|---|---|
| Planning/commercial core (`scope-items`, `cost-items`, `budget`, `bid-packages`) | Functional in live mode; the checked-in app already has these surfaces and they must stay aligned with the shared target model |
| Scope details and selections | Implemented enough for the real project's planning workflow, or explicitly handled outside the app until those target surfaces are built |
| Sequencer | Functional in live mode against real Dataverse data; the checked-in app already supports this through direct Dataverse access |
| Action Items | Functional in live mode; the checked-in app already supports this |
| Change orders | At minimum a read-only or intentionally deferred workflow, not a blank placeholder presented as production-ready |
| RFIs | At minimum a read-only or intentionally deferred workflow before promising them as part of a real-project rollout |
| Files | Functional at `/projects/[id]/files` with SharePoint browse, upload, and Dataverse registration/attachment support |

### Dataverse readiness

- The required target shared tables (`rlh_scopeitems`, `rlh_tasks`, and related tables) exist in the live Dataverse environment
- The existing tables that remain part of the target model (`cr6cd_projects`, `cr6cd_trades`, `accounts`, `contacts`, `cr6cd_mobilizations`) are accessible
- The shared gate classification field on `cr6cd_mobilizations` exists or is intentionally mapped in the live environment
- Any compatibility reads used by the current sequencer are direct Dataverse reads, not app-to-app integration

---

## Coexistence Rules

During the adoption period:

- Trevor's app and the shared app may both exist, but they are operationally separate
- The shared app connects only to Dataverse, SharePoint, and Microsoft identity services
- Trevor's app can remain live for other projects or as a fallback, but the shared app does not depend on it
- A project started or recreated in shared tables does not need Trevor data imported in order to work
- Compatibility reads are optional and only used where they still help with current execution context
- No automated two-way sync is needed because there is no app-to-app integration layer

---

## Project Adoption Path

How a single project starts using the shared app successfully.

### 1. Stand up schema and connection

Confirm that the shared app can authenticate correctly, reach the live Dataverse environment, and see the required target shared tables plus the existing tables that remain part of the long-term model.

### 2. Seed or recreate the project in shared tables

Create the project-scoped shared records the app actually needs, such as:

- `rlh_scopeitems`
- `rlh_scopedetails`
- `rlh_costitems` when needed
- `rlh_bidpackages` and `rlh_quotes` when needed
- `rlh_tasks` with required trade-type and mobilization links, plus optional company and scope-item links when the workflow needs them

If the project's current Trevor-side data is light, recreate what is needed directly in the shared model instead of trying to preserve every old row shape.

### 3. Optional compatibility review

If it is useful, compare the project's current live execution state against existing Dataverse compatibility tables such as `cr6cd_buildphases`, `rlh_tradeitems`, or `cr6cd_mobilizationmarkerses`.

This review is optional. It is not a prerequisite for the shared app to function.

### 4. Use the shared app as the primary interface

Run the project from the shared app for daily development and execution work. Trevor's app may remain live independently, but the shared app should be able to function from the Dataverse tables it owns or intentionally keeps.

### 5. Reduce compatibility dependence

As the project stabilizes in the shared model:

- prefer shared gate classification on mobilizations over `cr6cd_buildphases`
- prefer `rlh_tasks` over legacy trade-item or marker representations
- keep using `cr6cd_mobilizations` where that still fits the target model
- stop relying on compatibility reads for that project when they no longer add value

---

## What Done Looks Like

### For a single project

- PMs use the shared app as their primary interface for both development and execution
- The project's current working data lives in target shared tables and intentionally kept existing tables
- Trevor's app is not required for that project's daily work
- No runtime dependency exists between the shared app and Trevor's app
- Compatibility reads are limited or unnecessary for that project

### For the product

- New work starts directly in the shared model
- Trevor's compatibility surfaces can be reduced, archived, or deprecated when they no longer help
- The shared app is deployed, authenticated, and the sole primary interface
- The shared app functions entirely through Dataverse, SharePoint, and Microsoft-backed auth boundaries

---

## Rollback

At every stage of adoption:

- Trevor's app may remain functional and deployed as a separate operational fallback
- Shared-table setup does not require destructive migration from Trevor's app
- If the team decides a recreated project setup is wrong, the shared records can be adjusted without rolling back imported history
- No irreversible app-to-app dependency is created because there is no app-to-app integration layer

---

## Related Workflows

- `workflows/execution.md`
