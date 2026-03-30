# Trevor Start Here

> Status: Authoritative

This is the shortest orientation for Trevor inside the shared repo.

If you want the one-sentence version:

`shared/` is the next version of the product: one app Trevor and Luke can both build in, with Trevor's strongest Microsoft and sequencing ideas plus Luke's scope-first planning model, so the system covers the whole project instead of splitting planning and execution across separate products.

---

## What Trevor/ Already Does Well

- Dataverse is still the backend for business records.
- SharePoint is still authoritative for file bytes and library metadata.
- Microsoft is still authoritative for identity and permission intent.
- Sequencing is still reasoning support, not autonomous execution control.
- The shared app is a direct Dataverse client, not a wrapper around your app.

---

## Why One App Matters

- Trevor already built a real sequencer.
- Luke already has product-development surfaces that belong in the same project story.
- It is better for planning, pricing, sequencing, files, and action items to live in one coherent app than in separate tools with separate mental models.
- One app means one navigation model, one component system, one implementation stack, and one place where the product philosophy actually has to hold together.

The point is not to replace Trevor's work with Luke's work.

The point is to stop splitting the product across two separate apps when the domain is clearly one product.

---

## Why The Current Sequencer Is Strong But Not The Best Long-Term Home

- The sequencer is real, valuable work. It already proves important execution ideas.
- The problem is not that the sequencer is weak.
- The problem is that it is being asked to carry too much of the whole product on its own.
- `trevor/` is strongest once the project is already living in the execution world.
- It does not yet frame planning, pricing, selections, files, and expectations as one equally strong product story.
- Too much of the product has to be inferred from the current execution tables and implementation details.
- The current execution-first shape also puts a lot of architectural weight on execution containers and hierarchy, which makes planning and commercial records feel too secondary.

This is the key framing change:

the sequencer is good, but it is not the best long-term home for the entire product by itself.

The shared repo is trying to keep what is strongest in Trevor's work while giving it a better surrounding system.

---

## Why This Should Make The Sequencer Better, Not Worse

- The sequencer is not being buried inside a generic project app.
- It stays a first-class execution surface in the combined product.
- It gets better upstream context around it: project scope, pricing, files, expectations, and action items all become easier to connect back to the board.
- It gets a better implementation environment for polish, interaction quality, and reuse.
- Trevor should have more freedom to make the sequencer feel how he wants because the app stack, component model, and shared product context are stronger.

The goal is not to water the sequencer down.

The goal is to give it a better home.

---

## Why The App Stack Changes

- Trevor's current app proves the execution ideas, and browser-direct HTML/JS has real strengths:
  - simpler architecture
  - fewer moving parts
  - a more direct user-to-Dataverse flow
  - a more obviously native Microsoft feel
- The reason to switch is not that those strengths are fake. The reason is that the product is growing beyond a narrower execution surface.
- As the app gets more ambitious, it becomes harder to keep the UI polished, the code organized, and the data flow easy to reason about in a page-by-page browser app.
- Next.js and React are a better fit for the kind of app this is becoming:
  - reusable components instead of repeated page-specific UI logic
  - shared layouts and route structure for a real multi-surface product
  - server-side permission checks and data fetching once the app has more surfaces and audiences
  - cleaner separation between domain translation, mutations, and UI rendering
  - easier iteration on look, feel, and interaction quality
- The goal is not "modern stack for its own sake." The goal is a codebase that makes it easier to build a polished app Trevor and Luke both want to keep extending.
- That applies to the sequencer too: the shared stack should make it easier to make the board look better, behave better, and evolve faster.
- The intended conclusion here is still clear: for the combined product, Next.js and React is the better path.

### Important differences and how we keep them safe

- **Difference:** the app server now sits between the user and Dataverse.
  - **Safeguard:** keep Microsoft sign-in and Microsoft-backed groups as the permission source, deny by default on the server, and do not let browser components call Dataverse directly in the target shared design.
- **Difference:** the app translates Dataverse records into cleaner domain objects.
  - **Safeguard:** keep Dataverse authoritative, keep translation centralized in one adapter layer, and keep bridge-vs-target behavior explicit.
- **Difference:** the app takes on more implementation responsibility than a page-by-page browser app.
  - **Safeguard:** keep one shared app, keep Dataverse as the backend, centralize platform access, and avoid creating a second business-data authority.
- **Difference:** server-side writes can obscure who really acted if the app is sloppy.
  - **Safeguard:** record acting-user context and treat audit stamping as a required part of the design.

If those safeguards stay real, the stack switch does not have to be less safe from a database perspective than the current browser-direct pattern.

---

## Why The Data Model Gets Flatter

- Trevor's current execution structures carry a lot of architectural weight because the app is centered on that part of the workflow.
- In the combined product, that makes planning and commercial records feel too secondary, or forces them to hang off execution-oriented containers.
- The shared model is trying to fix that by making the main thing the **domain objects under a project**:
  - project scope
  - cost items
  - bid packages
  - selections
  - mobilizations
  - action items
  - files
  - expectations
- Those objects should link to each other in the ways the product actually needs, instead of being forced through one strict hierarchy just because one table used to sit at the center.

This is why the docs keep emphasizing:

- project as the container
- domain objects as peers
- correct links over rigid hierarchy

---

## What Luke/ Adds And Why It Matters

- **Scope-first planning** so the team can understand the work before forcing it into cost structure.
- **A fuller planning and commercial model** so scope, bidding, selections, and pricing are first-class instead of secondary to execution.
- **The project as a structured, queryable knowledge base** so files, context, expectations, and execution all connect back to the same model.
- **Stronger product-thesis and AI-operating docs** so the repo explains not just how the app works, but why the system should be organized this way.

---

## What Changed Intentionally

- This repo is now the main product definition, not a comparison notebook.
- The docs now explain the target shared product directly instead of making readers reverse-engineer it from the current implementation.
- Project scope is the planning center.
- Cost items become the financial control center once created.
- When the team builds the schedule, it creates action items either from project scope or directly.
- Mobilizations group those action items; project scope does not sit inside mobilizations directly.
- Gates stay as execution structure, but they are no longer asked to carry the entire product philosophy on their own.
- Compatibility with current sequencer tables still matters, but it is described as current implementation context rather than the main product story.

---

## Sequencer Clarification

The target shared sequencing workflow is:

1. development creates project scope in preconstruction
2. when it is time to build the schedule, create an action item from a project-scope item or create a new action item directly
3. each action item carries a required trade type and required mobilization assignment
4. each action item may also link to a company and a project-scope item when that context exists
5. each mobilization sits in one of the five shared gates

That is the key difference from the older misleading phrasing.

Project scope still carries work continuity, but the sequencer groups **action items** into mobilizations, not project scope.

---

## What The App Actually Has Today

Implemented project surfaces in the checked-in app:

- `budget`
- `cost-items`
- `scope-items`
- `bid-packages`
- `expectations`
- `sequencer`
- `scope-items` (execution)
- `files`

Still placeholder or scaffolded:

- `estimate`
- `communication`
- `change-orders`

In the target model but not yet full checked-in project routes:

- `scope-details`
- `selections`
- `rfis`

---

## What To Read In 10 Minutes

1. `CURRENT_STATUS.md`
2. `PROJECT_CONTEXT.md`
3. `reference/PRODUCT_VISION.md`
4. `reference/COMPATIBILITY_MAP.md`
5. `reference/DATA_FLOW.md`
6. `app/SEQUENCER.md`
7. `workflows/transition.md`

That set should answer:

- what the shared product is
- what stayed from your current world
- what changed intentionally
- what is target-model versus bridge-only

---

## If You Want To Click Around First

1. Run the app in mock mode using `app/LOCAL_SETUP.md`.
2. Open `/projects`.
3. Open `/projects/proj-001`.
4. Open `/projects/proj-001/scope-items`.
5. Open `/projects/proj-001/sequencer`.
6. Open `/projects/proj-001/files`.
7. Read `reference/COMPATIBILITY_MAP.md` while comparing the sequencer to the target shared model.

---

## If You Are Using Claude Or Codex

Say:

`I'm Trevor. Tell me what's going on.`

The assistant should read this file first, then:

- `CURRENT_STATUS.md`
- `PROJECT_CONTEXT.md`
- `reference/PRODUCT_VISION.md`
- `reference/COMPATIBILITY_MAP.md`
- `app/SEQUENCER.md` if the current sequencer or bridge is part of the question

The answer should explain:

- what `trevor/` already does well
- why Trevor and Luke should be building the same app
- why Trevor's current sequencer/app is strong but not the best long-term home for the entire product
- why the Next.js/React stack is a better fit for the product
- why the data model is flatter under projects instead of centered on one strict hierarchy
- which Luke ideas are being brought in and why
- what `shared/` is changing and why
- why this should make the sequencer better rather than bury it
- how the target sequencer workflow works: project scope first, then action items, then mobilizations, then gates
- what still carries forward from your existing system
- what the app already supports today
- what to read or open next
