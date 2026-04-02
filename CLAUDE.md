# Shared Repo — AI Rules

> Status: Authoritative

This file governs this repo, including `app/`.

This repo contains the shared product docs, AI working docs, and the checked-in Next.js app for the combined Microsoft construction product.

---

## What this repo is

This repo is the documentation and implementation home for the combined Microsoft app. It contains:

- `reference/` — Stable docs that define what the system is. Read before making any structural decision.
- `workflows/` — Step-by-step docs describing how PMs use the app.
- `skills/` — AI operating procedures for recurring work in this repo.
- `collaboration/` — collaboration-specific onboarding, sandbox workflow, and open/closed decision tracking.
- `app/` — the current checked-in Next.js implementation

---

## How this file relates to the reference docs

This file defines **behavioral rules** for AI agents working in this repo. The reference docs define **what the product is**. The workflow docs define how PMs use it. The skills docs define how AI should approach recurring work. All three layers apply when working in `app/`.

---

## Fresh Session Read Order

For a new Claude or Codex session, the fastest reliable read order is:

1. `CURRENT_STATUS.md`
2. `TREVOR_START.md` if the user identifies as Trevor or asks for high-level repo orientation
3. `PROJECT_CONTEXT.md`
4. `reference/PRODUCT_VISION.md`
5. `reference/COMPATIBILITY_MAP.md`
6. `reference/DOMAIN_MODEL.md`
7. `reference/DATA_FLOW.md`
8. `reference/SCHEMA_PLAN.md`
9. `reference/SYSTEM_ARCHITECTURE.md`
10. `reference/PERMISSIONS.md`
11. `reference/AI_STRATEGY.md`

If touching implementation after that:

- read `app/README.md`
- read `app/LOCAL_SETUP.md`
- read `app/SEQUENCER.md` before changing sequencer behavior
- read `workflows/files.md` before changing file-management behavior

If the task is about GitHub branches, pull requests, or coordinating Luke's and Trevor's sandboxes, also read `collaboration/GITHUB_SANDBOX_WORKFLOW.md`.

If the task opens or closes a meaningful Luke-and-Trevor decision, also read `collaboration/README.md`.

Then follow the relevant skill in `skills/`.

`README.md` is for human readers. `collaboration/ONBOARDING.md` is situational — read it when onboarding a new contributor.

---

## Change Classification

Every task in this repo should be treated as one of:

- `target-model` — changes the intended shared product model or its authoritative docs
- `bridge-only` — changes compatibility behavior or current implementation without redefining the target model
- `documentation-only` — clarifies docs without changing product or implementation behavior

If the task touches current Trevor compatibility surfaces, treat it as `bridge-only` unless the docs explicitly say the surface belongs in the long-term model.

---

## Current Implementation Snapshot

Important current-state context for fresh sessions:

- the checked-in app already uses flat peer routes under `/projects/[id]/...`
- `/projects/[id]` is a real project home, not a redirect
- files are project-level at `/projects/[id]/files`
- estimate, communication, and change orders are still placeholder or scaffolded routes
- the current sequencer still uses some Trevor-era Dataverse compatibility tables
- the shared app is a new direct client of Dataverse and SharePoint, not a wrapper around Trevor's app
- the app does not own project truth; it displays, enforces, and normalizes truth held in Microsoft systems

---

## Skills And Automatic Triggers

Use these skills automatically when the task fits:

| Skill | Use it when |
|---|---|
| `skills/new-session.md` | starting any non-trivial session |
| `skills/trevor-orientation.md` | onboarding Trevor or answering repo-orientation questions from Trevor's current-world perspective |
| `skills/close-session.md` | closing a working session |
| `skills/new-feature.md` | implementing or revising a non-trivial feature or workflow |
| `skills/schema-change.md` | proposing or implementing any schema change |
| `skills/doc-sync.md` | updating docs or verifying docs against implementation |
| `skills/compatibility-change.md` | touching bridge surfaces, sequencer compatibility behavior, or Trevor-owned current tables |

Automatic triggers:

- session start -> `skills/new-session.md`
- user says "I'm Trevor", asks "tell me what's going on", or wants a high-level shared-vs-current-world orientation -> `skills/trevor-orientation.md`
- any non-trivial feature request -> `skills/new-feature.md`
- any schema change -> `skills/schema-change.md`
- any work touching compatibility tables or the current sequencer bridge -> `skills/compatibility-change.md`
- any documentation-heavy session or any session that changes repo truth -> `skills/doc-sync.md`
- session close -> `skills/close-session.md`

---

## Trevor-First Orientation Rule

If Trevor opens this repo and asks for orientation, answer in this order:

1. what `trevor/` already solved well
2. why Trevor and Luke should be building the same app
3. why Trevor's current sequencer/app is strong but not the best long-term home for the whole product by itself
4. why the Next.js/React implementation path is better for the combined product, including the important differences from browser-direct HTML and how the shared design keeps those differences safe
5. why the data model is flatter under `project` instead of centered on one strict hierarchy
6. which Luke ideas are being brought in and why
7. what `shared/` is changing and why
8. why this should make the sequencer better instead of burying it
9. what still carries forward from Trevor's current world
10. what the checked-in app actually supports today
11. what is target-model versus bridge-only
12. how the target sequencer workflow works: project scope first, then action items, then mobilizations, then gates
13. what to read or open next

Use `TREVOR_START.md` as the first orientation doc for that answer.

Do not frame Trevor as an outsider being adopted into someone else's repo. He is a co-author of the combined product, and the answer should make continuity and change both legible.
Do not skip the "the current sequencer is good, but not the best long-term home for the whole product" framing before describing shared-model changes.
Do not say or imply that project scope is grouped directly into mobilizations in the target shared model.
Do not present the stack switch as a free win, but do not make it sound like a reluctant compromise either. Name the important differences, explain the safeguards, and still land clearly on Next.js/React as the better path for the combined product.

---

## Rules for any AI working in this repo

### 1. The domain model is the source of truth

`reference/PRODUCT_VISION.md`, `reference/DOMAIN_MODEL.md`, and `reference/DATA_FLOW.md` define the product thesis, the core objects, and how information should move through the system. Do not invent domain objects, relationships, or rules that are not supported by those docs. If a new concept is needed, propose it explicitly.

### 2. Schema lives in SCHEMA_PLAN.md

`reference/SCHEMA_PLAN.md` is the only valid source of truth for Dataverse table structure. Do not build against tables or fields that are not in SCHEMA_PLAN.md. If the schema needs to change, update SCHEMA_PLAN.md first.

### 3. The app must not invent truth

The shared app is a controlled display, enforcement, and normalization layer.

It must not:

- invent authoritative project data locally
- treat mock data as real product truth
- silently upgrade bridge behavior into target-model behavior
- imply that app state is more authoritative than Microsoft-backed identity, Dataverse business records, or SharePoint files

### 4. Track open and closed shared decisions

If a session opens a meaningful Luke-and-Trevor decision, record it in `collaboration/DECISIONS_OPEN.md`.

If a session closes a meaningful Luke-and-Trevor decision, record a concise summary in `collaboration/DECISIONS_CLOSED.md` and keep the authoritative docs in sync.

### 5. Do not add implementation artifacts here

Docs describe the system — not code, not configuration files, not Power Apps YAML. Those live in the app itself.

### 6. Keep docs current

If a session changes something about the system, update the relevant doc before closing. Docs that don't match reality are worse than no docs.

### 7. Escalate shared-domain decisions

If a decision would change the shared domain model in a way that affects other implementations of it, surface that impact before making the change.

### 8. Be careful with framework assumptions in `app/`

When working in `app/`, do not assume your training data matches the checked-in Next.js version. Read the relevant guide under `app/node_modules/next/dist/docs/` before making framework-level changes, and heed deprecation warnings.

### 9. Preserve the current project model

Do not reintroduce the old grouped-route mental model as if it were still authoritative.

Current intended model:

- project routes are flat peers under `/projects/[id]/...`
- Development, Preparation, Execution, and Financial are sidebar groupings only
- `Project Scope` may intentionally bridge Development and Preparation in the sidebar
- files are project-level at `/projects/[id]/files`
- the shared app is not connected to Trevor's app

### 10. Preserve the current files boundary

Do not turn Dataverse into the file store and do not treat SharePoint as optional decoration.

Current intended boundary:

- SharePoint owns file bytes and library metadata
- Dataverse owns lightweight file references and record attachments
- the app links them together

If SharePoint metadata behavior changes, confirm real field names before hardcoding them.

### 11. Preserve explicit execution structure

Gates are execution classifications used to organize mobilizations over time.

The shared app, sequencing logic, and any AI layer may:

- explain
- summarize
- highlight gaps
- help prepare

They may not:

- silently reclassify gate or mobilization structure
- imply backend structure from schedule guesses alone
- trigger execution
- silently mutate canonical execution records

### 12. Keep bridge logic explicit

If work touches `cr6cd_buildphases`, `rlh_projecttrades`, `rlh_tradeitems`, `cr6cd_mobilizationmarkerses`, or similar current bridge surfaces:

- say so clearly
- keep the target-model docs clean
- update `reference/COMPATIBILITY_MAP.md` and `app/SEQUENCER.md` when needed
- do not present bridge behavior as if it were the long-term product design

### 13. Follow the shared sandbox workflow for Git questions

If the user asks how to start work, sync a sandbox, name a branch, or open a pull request in this repo:

- read `collaboration/GITHUB_SANDBOX_WORKFLOW.md`
- follow that process unless the user explicitly says the team changed it
- do not invent a parallel Git workflow in your answer
