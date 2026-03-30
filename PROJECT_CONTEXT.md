# Project Context

> Status: Authoritative

Read this first if you need to understand what this repo owns.

---

## What The Product Is

The combined product is a Microsoft-backed construction operating system for Rangeline Homes.

It is built for the way custom-home builders actually think about projects:

- start with scope, not spreadsheets
- keep execution structure explicit instead of burying it in app assumptions
- make project information structured enough to be priced, coordinated, queried, and trusted

The shared product is organized with three **visual project groupings**:

- **Development** — scope details, project scope, selections, bidding, and optional cost items
- **Execution** — gate-classified mobilizations and field action items created from project scope or directly
- **Admin** — files, changes, questions, expectations, and scoped knowledge

Those are navigation groupings, not ownership layers. Under the hood, project records remain peers linked under the project container.

The shared product is not Luke's system pasted onto Dataverse, and it is not Trevor's current execution system stretched to cover planning. It is one co-owned product that borrows the strongest ideas from both and clarifies them in one model.

---

## What This Repo Owns

This repo is the authority for the combined product's:

- product framing
- domain model
- Dataverse target schema
- system architecture
- PM workflows
- implementation notes for the checked-in Next.js app in `app/`

If an external source document conflicts with a current authoritative doc here, this repo wins for the combined product.

---

## Repo Boundaries

- this repo — primary documentation and the active shared-app implementation
- outside Trevor source material — original docs, Dataverse exports, sequencing context, and Microsoft-boundary material used to inform compatibility and execution design
- outside Luke source material — earlier product framing, AI workflow patterns, and scope-first construction thinking that inform the shared direction

Trevor and Luke source material are both valuable, but they are not the product definition for the shared system. This repo defines the product the team is actively converging on.

---

## Core Product Thesis

The combined product is built around nine core ideas:

1. **The project is a structured, queryable source of truth.** Scope, selections, execution state, files, and operational guidance should live in one coherent model instead of scattered notes, folders, and side conversations.
2. **Planning is scope-first.** Scope details capture atomic facts, project scope turns them into trade-ready work descriptions, and cost items are created when financial control is actually needed.
3. **Execution structure stays explicit.** Gates and mobilizations organize field work over time. Sequencing explains intent, but it does not control the jobsite or silently invent backend structure.
4. **Trevor and Luke should be building the same app.** Planning/commercial work and execution work belong in one product, not separate apps with separate mental models.
5. **The shared product uses a hybrid center.** Project remains the container, project scope is the planning and work-continuity center, cost items are the financial control center once created, mobilizations carry the time slice, and action items carry coordination.
6. **The main thing is domain objects under projects.** The model should prefer peer project records with explicit links over a stricter table hierarchy that forces too much meaning through one execution-oriented container.
7. **The shared app should make the sequencer better, not smaller.** Execution remains a first-class part of the product, and the stronger app stack plus richer project context should give Trevor more freedom to improve the board instead of burying it.
8. **The app does not invent truth.** Microsoft remains the authority for identity and permission intent, Dataverse remains the authority for business records, SharePoint remains the authority for files, and the app displays, enforces, and normalizes those systems.
9. **Compatibility is explicit, not foundational.** Trevor's current Dataverse structures still matter in the bridge, but they are input and compatibility surfaces rather than the constitutional definition of the shared product.

---

## Architectural Direction

The combined product is built around these non-negotiable platform boundaries:

1. **Dataverse stays the backend for the shared product.**
2. **Microsoft remains the authority for identity and permission intent.**
3. **SharePoint remains the authority for file bytes and library metadata.**
4. **The shared app is a peer on Dataverse, not a wrapper around Trevor's current app.**
5. **The shared model may redesign Trevor's current table usage where it improves the long-term product.**
6. **Next.js and React are the long-term implementation vehicle.** The product needs a codebase that supports richer UI quality, reusable components, server-side enforcement, and shared ownership across many product surfaces.
7. **Development, execution, and admin stay as UI groupings only.** They help navigation, but project records stay flat peers under the project.

---

## What Success Looks Like

The combined product succeeds when:

- Trevor and Luke can work inside the same app and codebase instead of building adjacent products
- PMs can move from scope shaping into bidding and execution without rebuilding intent in multiple models
- Trevor can see his strongest execution principles preserved without the shared product freezing around legacy table shapes
- Trevor can make the sequencer more polished, expressive, and connected to the rest of the project instead of protecting it inside a narrower app shell
- Luke can see scope-first planning, structured project data, and queryable project context reflected directly in the shared docs
- the app becomes easier to make polished, coherent, and maintainable than the current browser-direct vanilla implementation path
- the docs explain the shared target architecture directly, without asking readers to reverse-engineer Luke's or Trevor's source folders
- Microsoft-backed identity and permissions remain the governing authority even when the shared app sits between the user and Dataverse
- the checked-in app can connect to selected existing Dataverse execution surfaces while the shared model moves toward explicit gate classification on mobilizations, scope-first planning, structured files, expectations, and action-item-based execution coordination with optional project-scope links, without any runtime dependency on Trevor's app

---

## Where To Go Next

- Product maturity snapshot: `CURRENT_STATUS.md`
- New-contributor adoption path: `collaboration/ONBOARDING.md`
- Product thesis: `reference/PRODUCT_VISION.md`
- Core concepts: `reference/DOMAIN_MODEL.md`
- Information system view: `reference/DATA_FLOW.md`
- Dataverse contract: `reference/SCHEMA_PLAN.md`
- System boundaries: `reference/SYSTEM_ARCHITECTURE.md`
- Identity and permissions: `reference/PERMISSIONS.md`
- Trevor bridge guide: `reference/COMPATIBILITY_MAP.md`
