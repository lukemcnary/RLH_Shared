# Data Flow

> Status: Authoritative

## Purpose

This document explains how information should move through the shared product.

It clarifies:

- where truth originates
- how records become more structured over time
- which systems remain authoritative
- where the app is allowed to transform or normalize data
- where the flow must stop

---

## Core Principle

The shared product is a **scope-first information system built on Microsoft-backed authority boundaries**.

The primary flow is not:

file -> UI -> local app state

It is:

identity -> project setup -> scope details -> project scope -> preparation and cost items when needed -> bidding and execution -> project history and future guidance

The app may normalize, enrich, and present that flow.

It may not invent a parallel truth.

---

## System Authority Layers

| Layer | Authoritative for | Never authoritative for |
|---|---|---|
| Microsoft identity and groups | sign-in, audience, permission intent | business-record truth, file bytes |
| Dataverse | business records, IDs, relationships, workflow state | file bytes, document libraries |
| SharePoint | file bytes, library metadata, document access | canonical business-record truth |
| Shared app | presentation, enforcement, normalization, orchestration | independent project truth |

The product depends on those boundaries staying clear.

---

## Flow Layer 1: Project Setup

The project begins with the project container and its initial structure.

Source-of-truth records include:

- project
- client link
- spaces
- initial trade and company context where known
- SharePoint project binding

Key rule:

The system should create enough structure to support real work, but it should not force the team to invent financial detail or downstream execution detail before that information exists.

---

## Flow Layer 2: Scope Definition

Scope definition is where the product becomes useful.

The flow is:

project
-> scope details
-> project scope
-> selections and spaces as context

Source-of-truth records include:

- `scope details` for atomic design and specification facts
- `project scope` for trade-ready planning intent
- `selections` for product and finish decisions
- `spaces` for location context

Key rule:

Planning truth should not be collapsed too early into cost records or schedule records. Project scope exists so the planning model can be clear before the financial model is fully formed.

Project scope should also remain the canonical bridge record as the work moves into preparation. Preparation surfaces may become more trade-assigned, coordination-ready, or sequencing-aware, but they should still tie back to the same project-scope item instead of replacing it with disconnected copies.

---

## Flow Layer 3: Financialization And Bidding

Cost items appear when financial control matters.

The flow is:

project scope
-> cost items when needed
-> bid packages
-> quotes
-> company assignment or confirmation

Source-of-truth records include:

- `cost items` for financial control
- `bid packages` for commercial packaging
- `quotes` for pricing response and award path

Key rule:

Cost items are not the starting point of the whole product, but once created they become the main financial tracking record for that scoped work.

The app should never pretend that a budget summary is more authoritative than the cost items that feed it.

---

## Flow Layer 4: Execution

Execution carries structured project intent into the field.

The flow is:

project scope
-> preparation surfaces where needed
-> action items created from project scope or directly
-> mobilizations with explicit gate classification
-> field updates, issues, and follow-up work

Source-of-truth records include:

- project scope for work continuity into preparation and execution
- action items for scheduled work, coordination, and checkpoints
- mobilizations for grouping action items into time-bound trade visits with explicit gate classification

Key rule:

Mobilization timing and gate classification should stay explicit in backend data. Sequencing, timing, and AI may support reasoning, but they may not silently invent, reclassify, or overstate execution structure. The sequencer should group action items into mobilizations rather than teaching that project scope is a direct mobilization content.

---

## Flow Layer 5: Files, Expectations, And Operational Context

The product is not complete if it only stores scope and execution records.

It also needs the context that makes those records useful:

- files
- expectations
- knowledge
- change and issue trails

Source-of-truth boundaries:

- SharePoint owns file bytes and library metadata
- Dataverse owns file references, links, and project-facing record context
- expectations and other operational guidance live as structured records, not hidden prose

Key rule:

The app may link context together, but it must not act like the file system of record or create made-up references that outrun the backend.

---

## Flow Layer 6: Future Learning And Guidance

The long-term product should learn from structured project work.

That future layer can draw from:

- repeated scope patterns
- recurring execution blockers
- expectation gaps
- unresolved questions
- historical bidding and cost context

This is where guided assistance eventually becomes powerful, but only if the earlier layers stay clean.

Key rule:

Future intelligence depends on structured truth. If the planning, execution, file, and expectation layers drift or become inconsistent, later AI or analytics become less trustworthy.

---

## App Transformation Rules

The shared app is allowed to:

- translate raw Dataverse fields into clean domain types
- normalize bridge-era table shapes into the shared target model
- enforce Microsoft-backed access before returning data
- merge Dataverse references with SharePoint file views

The shared app is not allowed to:

- invent authoritative records locally
- silently replace Microsoft-backed identity or permission rules
- imply that compatibility behavior is the same thing as target-model behavior
- treat placeholder UI state as backend truth

---

## Compatibility In The Data Flow

Compatibility is part of the current flow, but it is not the definition of the flow.

During the bridge:

- the app may still read or write some Trevor-era execution surfaces
- those surfaces may be normalized into the shared domain view
- the compatibility path must remain explicit in docs and implementation notes

The target shared data flow should still be described in shared terms first.

---

## Practical Test

The data flow is healthy when a reader can answer these questions cleanly:

- Which system owns this information?
- Is this a planning record, a financial record, an execution-truth record, or supporting context?
- Is this target-model behavior or bridge behavior?
- Is the app displaying backend truth, or is it accidentally acting like a second source of truth?
