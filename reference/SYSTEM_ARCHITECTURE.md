# System Architecture

> Status: Authoritative

This document describes how the combined Microsoft app is structured, what each layer is responsible for, and how the shared product should relate to Trevor's current Dataverse setup.

The key posture is simple:

- the shared product stays on Dataverse
- the shared app is an independent Dataverse client
- Microsoft remains the authority for identity and permission intent
- the shared product does **not** freeze Trevor's current schema in place as the long-term architecture
- compatibility is real, but it is temporary and explicit

The best mental model is:

- `Project` is the container
- most major records under a project are peers
- `Project Scope` is the planning/work-continuity center
- `Cost Item` becomes the financial control center once created
- mobilizations carry explicit gate classification for project time slices
- the system is defined more by **correct links** than by one dominant parent table beyond the project itself
- Development, Preparation, Execution, and Financial are useful UI groupings, not parent data layers

---

## Visual Groupings, One Project Model

The app still groups routes visually as Development, Preparation, Execution, and Financial, but those are navigation labels only.

- Development groups scope-shaping and commercial surfaces such as estimate thinking, canonical project scope, and bidding.
- Preparation groups the bridge surfaces that carry canonical scope into trade coordination, expectations, and sequencing-ready prep.
- Execution groups delivery surfaces such as sequencer and field action items.
- Financial groups budget, cost items, and change-tracking surfaces tied to the same project model.

`Project Scope` is intentionally allowed to bridge Development and Preparation in the current app IA because the same canonical scope item needs to survive both phases.

Those groupings help people navigate, but the data model stays flat under the project. Records remain peers linked together correctly instead of living "inside" a section.

---

## Architectural Posture

### 1. Selective redesign on Dataverse

The shared product uses Dataverse as its backend, but it does not assume Trevor's current table usage is the final shape.

Examples:

- mobilizations carry a shared gate classification instead of treating `cr6cd_buildphases` as the long-term model
- project scope stays linked through pricing, bidding, scope-item creation, and field coordination
- action items support coordination and checkpoints around that work
- `rlh_projecttrades` stays a project-to-trade link for grouping and compatibility
- Trevor's prep, marker, and trade-detail tables become compatibility surfaces rather than target model centers

### 2. One app for one product

The long-term goal is not "Trevor's execution app plus Luke's planning app."

The long-term goal is one shared app that covers the project more completely:

- planning and commercial work
- execution coordination
- files and operational context
- future assistive tooling

That is why the checked-in app already mixes project scope, bidding, sequencer, action items, expectations, and files under one route model.

This should not make the sequencer less important.

It should make the sequencer easier to improve because it becomes a first-class surface inside a stronger overall product and codebase.

### 3. Why Next.js and React are the better implementation path

Trevor's current app proved important execution ideas, and browser-direct HTML/JS has real strengths:

- very simple architecture
- a direct user-to-Dataverse model
- fewer moving parts to host and maintain
- a more obviously Microsoft-native permission path

If the product were staying a narrow execution tool, that approach would remain more defensible.

The reason the shared app changes stacks is not that browser-direct HTML is "wrong." It is that the product is no longer just one execution surface. It is becoming a broader app that needs to hold planning, pricing, sequencing, files, expectations, and future assistive tooling together in one coherent system.

For that broader product, Next.js and React are still the better long-term choice. The goal is to gain flexibility, polish, and maintainability without becoming less safe from a database and authority-boundary perspective.

Why the shared app uses Next.js and React:

- reusable components make UI quality easier to improve consistently
- shared layouts and route structure fit a multi-surface product better than page-by-page scripting
- server-side reads, writes, and permission checks are easier to reason about once the app has many surfaces and audiences
- adapter and feature layers make it easier to separate domain translation from UI behavior
- mock mode and typed domain models make iterative product work safer

The stack change is not aesthetic. It is meant to make the app easier to maintain, easier to polish, and easier for Trevor and Luke to build together.

That includes the sequencer itself:

- better component reuse
- easier layout and styling iteration
- clearer server-side mutation paths
- a more maintainable foundation for richer board behavior

### 3a. Important differences in the stack change, and how the shared app keeps it safe

Moving away from browser-direct HTML does introduce important differences. The shared architecture is still the better choice, but only if it handles those differences deliberately.

**Difference: the app server now sits between the user and Dataverse.**

Why this stays safe:

- Microsoft sign-in remains the human identity path
- Microsoft-backed groups remain the source of permission intent
- the app server denies by default before returning project data
- the app must not create broader app-local roles than Microsoft allows
- browser components do not call Dataverse directly in the target shared architecture

If those rules are followed, this does not have to be less safe than browser-direct access. It can be safer because the browser no longer holds direct Dataverse access and the server can enforce the same checks consistently across every feature surface.

**Difference: the app translates Dataverse records into cleaner domain objects.**

Why this stays safe:

- Dataverse remains the system of record for business data
- field translation stays concentrated in the Dataverse adapter layer
- the app must not invent authoritative records locally
- bridge behavior and target-model behavior stay explicitly separated in docs and implementation notes

**Difference: the app takes on more implementation responsibility than a page-by-page browser app.**

Why this is still the right trade:

- the shared product keeps one app, not multiple custom services
- Dataverse stays the backend instead of adding a second business database
- page files stay thin, feature actions own writes, and shared libraries own platform access
- mock mode and typed domain models reduce change risk during iteration

**Difference: server-side writes can make acting-user context easier to lose if the app is careless.**

Why this stays safe:

- the app records acting-user context on writes
- audit stamping is treated as a requirement, not a nice-to-have
- Microsoft identity remains the human source for sign-in and access review

The recommendation is therefore not "Next.js and React is identical to browser-direct HTML."

The recommendation is:

- browser-direct HTML is simpler and more native
- Next.js and React carry more responsibility
- the shared product accepts that extra responsibility because the broader product needs the flexibility, reuse, and control
- if the safeguards above stay enforced, the app can be as safe from a database-governance perspective while being much better suited to the product Trevor and Luke are actually building

### 4. Peer apps, not wrapped apps

Trevor's app and this repo's `app/` are peers on Dataverse. Neither is a backend for the other. Both read and write the same environment through the platform APIs.

The shared app is completely new. Its required platform connections are Dataverse for business records, SharePoint for files, and Microsoft identity services for sign-in and permission intent. It does not call Trevor's app, wrap Trevor's app, or depend on Trevor's runtime in order to function.

### 5. Microsoft remains the permission authority

The shared product should not create an app-local permission universe.

Target posture:

- users sign in with Microsoft identities
- Microsoft-backed groups and roles remain the source of permission intent
- the shared app enforces those permissions on the server
- Dataverse remains the backend for business records
- SharePoint remains the backend for documents and file access

The app is a controlled gateway and enforcement layer. It is not the authority for identity.

### 6. The app displays, enforces, and normalizes truth

The shared app is allowed to:

- enforce Microsoft-backed access
- translate platform records into clean domain types
- normalize compatibility surfaces into the shared domain view
- merge Dataverse business records with SharePoint file context

The shared app is not allowed to:

- invent authoritative records locally
- imply that UI state is more authoritative than backend state
- hide bridge behavior behind target-model language

### 7. Explicit compatibility boundaries

The shared docs separate three categories:

- **target shared tables** that define the long-term product
- **extended Trevor tables** that still belong in the target model
- **compatibility surfaces** that may stay in use during transition but are not the long-term design center

Compatibility here is about Dataverse tables and field shapes, not about integrating the shared app with Trevor's UI or deployment.

### 8. Why the project model stays flatter

The shared product should avoid making one strict table hierarchy carry too much of the product's meaning.

If everything has to hang from one execution-oriented chain such as build phase -> project trade -> trade items, the planning and commercial model gets warped around execution containers that were not designed to hold the whole product.

The flatter project model is intentional:

- project is the container
- major records are peers
- links are explicit
- hierarchy appears where it actually helps, not where it distorts the domain

That is why the architecture keeps saying "correct links" instead of "one dominant parent table."

---

## Application Layer Map

```text
Browser
-> Next.js server
  -> page.tsx files stay thin
  -> feature actions own writes
  -> lib/dataverse/queries owns translation
  -> lib/dataverse/client owns auth + OData HTTP
  -> lib/sharepoint/* owns Graph auth, library rules, and file orchestration
-> Dataverse
  -> target shared tables
  -> extended Trevor tables
  -> compatibility tables during migration
-> SharePoint
  -> file bytes + library metadata
```

## Identity and Permission Flow

The recommended target flow is:

```text
User signs in with Microsoft
-> shared app receives Microsoft identity and audience context
-> server-side permission checks run
-> server reads or writes Dataverse
-> app returns only the allowed data
-> SharePoint file access remains governed by SharePoint audiences
```

Important clarification:

- Dataverse is still the backend
- the app is not storing project truth in its own database
- the app should enforce Microsoft-backed permissions, not replace them

### Current bridge vs target posture

The checked-in app currently uses server-side Azure app credentials for live Dataverse access.

The target posture adds Microsoft sign-in and Microsoft-backed permission enforcement on top of that server-side pattern rather than moving toward browser-direct Dataverse access as the long-term shared design.

### Dataverse buckets in the shared model

**Target shared tables**

- `rlh_spaces`
- `rlh_scopedetails`
- `rlh_scopeitems`
- `rlh_costitems`
- `rlh_selections`
- `rlh_bidpackages`
- `rlh_quotes`
- `rlh_tasks`
- `rlh_knowledgeentries`
- `rlh_expectations`
- `rlh_projectexpectations`
- `rlh_capabilities`
- `rlh_costcodes`
- `rlh_clients`
- `rlh_files`
- `rlh_filelinks`
- `rlh_changeorders`
- `rlh_rfis`
- plus junction tables for scope, cost, bidding, selection, and company relationships

**Extended existing tables**

- `cr6cd_projects`
- `cr6cd_mobilizations`
- `cr6cd_trades`
- `accounts`
- `contacts`

**Compatibility surfaces**

- `cr6cd_buildphases`
- `cr6cd_gatedeclarationsjson`
- `cr6cd_stepsjson`
- `cr6cd_markersjson`
- `cr6cd_mobilizationmarkerses`
- `rlh_projecttrades`
- `rlh_tradescopes`
- `rlh_tradeitems`
- `rlh_tradetemplates`

---

## Data Flow: Reads

The shared app should continue using the same read architecture:

```text
User opens a route
-> page.tsx server component runs
-> permission checks run using Microsoft-backed identity and project-access context
-> adapter/query functions read Dataverse
-> raw OData becomes clean domain types in lib/dataverse/queries/
-> typed props flow into client components
-> client components manage UI state only
```

What changes is **which domain shape the queries should normalize toward**.

For a project that starts directly in the shared model, the query layer can read target shared tables without any legacy carryover. Compatibility normalization is optional, not foundational.

The query layer should increasingly normalize current Trevor data into the shared target model:

- explicit gate classification on mobilizations, not just Trevor build phases
- project-scope continuity across planning and execution through action items, not a direct mobilization-to-project-scope target layer
- shared action items for coordination and checkpoints, not separate legacy steps/markers mental models
- direct company links and bid/award context, not rich `ProjectTrade` state

---

## Data Flow: Mutations

The shared app should continue using Server Actions for writes:

```text
User changes data in the UI
-> client component calls a Server Action
-> Server Action verifies Microsoft-backed permission
-> Server Action transforms domain payload into Dataverse payload
-> write goes to Dataverse through dvFetch()
-> revalidatePath() refreshes server-rendered data
```

Mutation ownership rules:

- page files do not write
- client components do not speak raw Dataverse
- query files translate reads
- feature actions translate writes
- permission enforcement happens before data is returned or mutated

---

## Primary Records By Concern

| Concern | Primary shared record(s) | Notes |
|---|---|---|
| Project record | `cr6cd_projects` | Existing Trevor table, shared fields allowed |
| Scope planning | `rlh_scopedetails`, `rlh_scopeitems` | Shared target planning records; project scope is the planning and work-continuity center |
| Financial scope | `rlh_costitems` | Created when financial detail is needed; becomes the financial control center once created |
| Company assignment | Direct company links on project records and/or `rlh_quotes` | Accepted quotes can populate or confirm company links; direct assignment is also valid |
| Execution classification | `cr6cd_mobilizations.rlh_gatekey` | Explicit gate classification lives on mobilizations; Trevor build phases remain compatibility input |
| Shared action items | `rlh_tasks` | Execution coordination and checkpoint records; action items may be created from project scope or directly and carry required trade type plus mobilization assignment |
| Mobilization schedule | `cr6cd_mobilizations` | Existing mobilization table stays; mobilizations group action items, carry gate classification, and may hold company context |
| Files metadata | `rlh_files`, `rlh_filelinks` | File bytes stay in SharePoint |
| Knowledge | `rlh_knowledgeentries` | One scoped system |

During adoption, the current app may still read compatibility surfaces directly from Dataverse to populate the target domain view. Projects can also start directly in target shared tables with no legacy carryover. That does not make compatibility tables authoritative.

---

## Compatibility Strategy

The product is intentionally taking an additive adoption path, not an app-to-app integration path.

### What stays live during the bridge

- Trevor's current sequencer tables can continue operating for projects that still use them
- Trevor's current Canvas/Power Apps flows can continue operating independently during adoption
- active and near-future projects can be recreated directly in shared tables when that is simpler than carrying forward older rows

### What the shared product should stop treating as design center

- `cr6cd_buildphases` as the long-term gate model
- `rlh_projecttrades` as a broader planning or assignment container
- `rlh_tradescopes` and `rlh_tradeitems` as the main prep or planning model
- `cr6cd_mobilizationmarkerses` as the permanent home of markers
- JSON blobs on mobilization as acceptable new first-class storage

### What shared code should do instead

- normalize toward explicit gate classification on mobilizations
- normalize toward project-scope continuity across planning and execution
- use action items for coordination and checkpoints
- read company assignment from bid/award
- treat legacy Trevor records as optional compatibility inputs, not required migration inputs

---

## Key Architectural Rules

### 1. Page files are thin

`page.tsx` files should contain:

- data fetching
- metadata export
- prop passing into feature views

No business logic lives in page files.

### 2. The UI holds workflow state, not system truth

Client components manage UI state such as selection, sorting, modal visibility, or drag state. Dataverse remains the system of record.

### 3. The query layer owns translation

No component should work with raw `cr6cd_`, `cr720_`, or `rlh_` API fields directly.

The adapter/query layer is responsible for:

- field renaming
- picklist translation
- compatibility normalization
- converting Trevor legacy shapes into shared domain types where needed

### 3b. The app must not invent truth

If backend truth is missing, the app may:

- say it is missing
- help the user navigate to the gap
- show bridge behavior clearly

It may not present guessed, local-only, or inferred values as if they are canonical project records.

### 4. Project Scope carries continuity across phases

Workflows should be designed so the same project-scope item can stay linked as the work moves into pricing, bidding, action-item creation, and field coordination.

Action items support follow-up, coordination, and checkpoints around that work.

### 5. Company assignment can be direct or bid-driven

If the builder already knows the company, shared records may link it directly.

If bidding is used, the accepted quote should populate or confirm that same company context automatically.

Execution surfaces may display or reuse that company context, but they should not redefine it inside a richer project-trade state object.

### 6. Shared docs define the target, app docs explain current implementation

When the checked-in app still uses a bridge shape, the app docs should say so clearly. The core reference docs should continue describing the target architecture.

### 7. The app must not outrun Microsoft permissions

The shared app may make access clearer and easier to use, but it must not grant broader access than Microsoft-backed identity, group membership, project audience rules, Dataverse permissions, and SharePoint file permissions are intended to allow.

---

## Project Route Structure

The target project route structure is flat peers under the project.

The checked-in app currently exposes a subset of these routes. `app/README.md` is the authoritative source for the current shipped surface.

```text
/projects/[id]
/projects/[id]/budget
/projects/[id]/cost-items
/projects/[id]/scope-items
/projects/[id]/scope-details
/projects/[id]/selections
/projects/[id]/bid-packages
/projects/[id]/sequencer
/projects/[id]/tasks
/projects/[id]/change-orders
/projects/[id]/rfis
/projects/[id]/files
/projects/[id]/expectations
```

Current important routes:

- `/projects/[id]`
- `/projects/[id]/budget`
- `/projects/[id]/scope-items`
- `/projects/[id]/sequencer`
- `/projects/[id]/tasks`
- `/projects/[id]/files`

The sidebar may still render Development, Preparation, Execution, and Financial groups, but those labels do not own the routes underneath them. `Project Scope` may appear as a bridge surface across Development and Preparation because the same canonical scope item needs to survive both phases.

---

## Microsoft Integration Points

| System | Role | Integration |
|---|---|---|
| Dataverse | System of record | OData REST API, Azure AD auth |
| SharePoint | File storage | Microsoft Graph + canonical project libraries |
| Teams | Communication | Native use, not part of shared app architecture yet |
| Azure AD | Authentication | Client credentials in current server-to-server setup |

---

## Development Environment

**Mock mode**

```bash
cd app
npm run dev
```

**Live mode**

```env
DATAVERSE_MODE=live
DATAVERSE_URL=https://rangeline.crm.dynamics.com
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

The same app can run in mock or live mode. What changes over time is the domain normalization and the Dataverse surfaces it writes to.
