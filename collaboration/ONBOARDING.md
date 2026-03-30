# Onboarding

> Status: Authoritative

This is the fastest way for Trevor, or any new contributor, to understand the shared product and get productive without needing live Dataverse access on day 1.

---

## What This Repo Is

This repo is the active documentation and implementation home for the combined Microsoft-backed product.

It combines:

- Luke's scope-first product framing
- Trevor's execution and Microsoft-boundary discipline
- a checked-in Next.js app that can run safely in mock mode

The app still uses some Trevor compatibility surfaces today, but the shared product itself is defined by the authoritative docs in `reference/`.

---

## Shared Product Snapshot

- The product is scope-first, builder-centered, and explicit about execution structure.
- Project data is intended to become structured and queryable rather than scattered across notes, folders, and one-off conversations.
- Project scope leads planning. Cost items are created when pricing and financial control are needed.
- Gates organize execution timing and mobilization grouping.
- The app is a direct client of Dataverse and SharePoint; it is not a wrapper around Trevor's app.

---

## What Will Feel Familiar From Trevor's Current World

- Dataverse still stays the backend.
- Build Gates remain a familiar execution structure for organizing mobilizations over time.
- Sequencing remains reasoning support, not autonomous execution control.
- The app still reads some familiar compatibility tables in the current sequencer.
- The app can be explored in mock mode without needing live Microsoft credentials on day 1.

---

## What Is Intentionally Different

- This repo is the main home for the combined product, not a comparison notebook.
- Trevor's current tables are important, but they are no longer assumed to be the final shared architecture.
- The product has a fuller planning and commercial model alongside delivery sequencing.
- The front-door docs are product-first rather than compatibility-first.

---

## What You Can Ignore On Day 1

You do **not** need to start with:

- live Dataverse credentials
- the future Microsoft sign-in implementation
- draft docs such as `reference/UI_DESIGN.md`, `reference/DOMAIN_GLOSSARY.md`, or `workflows/project-closeout.md`
- deep historical troubleshooting notes that are kept outside the shipping repo surface

Start with the adoption path below first.

---

## Fastest Claude Prompt

If you open this repo in Claude or Codex and just want the shortest orientation, say:

`I'm Trevor. Tell me what's going on.`

The assistant should begin with `TREVOR_START.md`, then use the first-day reading order below to fill in detail.

---

## First-Day Reading Order

1. `CURRENT_STATUS.md`
2. `TREVOR_START.md`
3. `PROJECT_CONTEXT.md`
4. `reference/PRODUCT_VISION.md`
5. `reference/COMPATIBILITY_MAP.md`
6. `reference/DOMAIN_MODEL.md`
7. `reference/DATA_FLOW.md`
8. `reference/SCHEMA_PLAN.md`
9. `reference/SYSTEM_ARCHITECTURE.md`
10. `reference/PERMISSIONS.md`
11. `reference/AI_STRATEGY.md`
12. `workflows/transition.md`
13. `app/LOCAL_SETUP.md`
14. `app/SEQUENCER.md` if you want to compare the current sequencer implementation to the target model
15. `collaboration/GITHUB_SANDBOX_WORKFLOW.md` if you are going to contribute from your own sandbox or ask Claude/Codex for GitHub instructions

---

## First-Day Hands-On Checklist

1. Open `app/LOCAL_SETUP.md`.
2. Run the app in mock mode.
3. Visit `/projects`.
4. Open `/projects/proj-001`.
5. Open `/projects/proj-001/scope-items`.
6. Open `/projects/proj-001/sequencer`.
7. Open `/projects/proj-001/files`.
8. Read `reference/COMPATIBILITY_MAP.md` while comparing what you see in the sequencer to the shared target model.
9. Read `workflows/transition.md` if you want the shared-table adoption plan before touching live Dataverse work.

That is enough to understand:

- what the combined product is aiming for
- what the app already does
- where Trevor compatibility still exists
- how the shared planning model differs from bridge-only execution surfaces

---

## Moving From Review To Contribution

- Start in mock mode unless your task truly needs live Dataverse access.
- Use `CONTRIBUTING.md` before making changes.
- Use `collaboration/GITHUB_SANDBOX_WORKFLOW.md` for the exact shared branch, sandbox, and pull-request sequence.
- If you change shared behavior, update the relevant source-of-truth doc in the same pass.
- If you touch a Trevor-owned existing or compatibility table, coordinate with Luke and Trevor before treating that table as part of the target model.
- If you are using Claude or Codex, follow the matching playbook in `skills/`.

Good first contributions:

- tighten a product doc that still feels unclear from either Trevor's or Luke's perspective
- improve mock-mode onboarding or setup
- clarify a compatibility boundary in `reference/COMPATIBILITY_MAP.md`
- improve a current route without changing the shared domain model
