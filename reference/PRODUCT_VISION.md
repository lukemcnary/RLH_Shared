# Product Vision

> Status: Authoritative

## Purpose

This document defines what the shared Rangeline product is trying to become.

It is not the schema plan, the app implementation guide, or the compatibility map. It is the product-level explanation of what kind of system the team is building and why it should exist.

---

## Core Philosophy

The shared product is a **scope-first construction operating system with explicit execution structure**.

It is designed for how experienced custom-home builders actually think:

- first understand the work
- then clarify who owns it
- then price it when needed
- then coordinate it clearly in the field

The product does not begin with budgets, schedules, or file trees.

It begins with a structured understanding of the project.

That structure is built through:

- scope details for atomic facts
- project scope for trade-ready planning intent
- cost items for financial control once pricing matters
- gate classification, mobilizations, and action items for field execution
- selections, files, expectations, and knowledge for the context that makes work understandable

---

## The Shared Product Model

The best way to think about the shared product is:

- **Project** is the container.
- **Project scope** is the planning and work-continuity center.
- **Cost items** become the financial control center once created.
- **Gate classification** provides the high-level execution structure on mobilizations.
- **Mobilizations** and **action items** carry active field coordination through the job.

This is intentionally a hybrid center.

The system is not purely cost-item-centered, and it is not a loose set of peer records with no center at all. Planning work and cross-phase continuity gravitate around project scope. Financial commitment and tracking gravitate around cost items. Active field coordination gravitates around mobilizations and action items, with gate classification providing the high-level execution structure.

That split matches the real work:

- builders do not need a fully priced cost structure the moment they first understand scope
- field execution should not wait for every planning surface to become a financial record
- the same project intent should survive from planning into execution without being rebuilt in a different model

---

## Why Scope First Matters

Most construction software asks users to start with the financial shell of the project.

That creates familiar problems:

- missing scope
- premature pricing detail
- weak handoff from planning to field
- selections trapped in documents instead of structured records
- files and knowledge that are hard to connect back to the actual work

A scope-first system reverses that pressure.

It lets the team:

- capture what the plans and specs actually say
- turn those facts into trade-ready scope
- create cost records when they are useful instead of when the software demands them
- carry the same intent into bidding, sequencing, and field execution

---

## Why One Shared App Matters

This product should not be split into a planning app and an execution app if both are really describing the same project.

That split creates predictable problems:

- different mental models for the same project
- duplicated UX and implementation work
- planning context that does not flow cleanly into execution
- execution surfaces that feel detached from the decisions that created them

The combined product should let Trevor and Luke build in one app because the builder experiences one project, not two adjacent systems.

---

## Why That Should Improve The Sequencer

Execution is not being demoted in the shared product.

The sequencer should become easier to improve because:

- it lives inside a stronger app stack
- it can reuse better components and interaction patterns
- it can connect more naturally to project scope, files, action items, expectations, and commercial context
- it no longer has to carry the entire product on its own

The goal is not to hide the sequencer inside a larger product.

The goal is to give it a better surrounding system and a better implementation environment.

---

## Builder-Centered Design

This product is meant to feel like a purpose-built system for builders and PMs, not a generic enterprise form layer.

It should prioritize:

- clarity over abstraction
- real project thinking over software taxonomy for its own sake
- flexible linking over brittle workflow enforcement
- operational usefulness over theoretical completeness

The shared product is not trying to make builders think like the platform.

It is trying to make the platform respect how builders already think.

---

## Domain Objects Before Rigid Hierarchy

The shared product should be organized around domain objects under the project, not around one rigid hierarchy that every other record must pass through.

That matters because different project records need different relationships:

- a project-scope item may link to many selections, action items, files, or cost items
- an action item may be created from a project-scope item or created directly, then assigned into mobilization work
- a mobilization belongs to a gate, but the work it relates to may also connect to scope, cost, files, or expectations
- files and expectations often matter across many parts of the project at once

When too much meaning is forced through one execution-oriented table chain, the rest of the product becomes distorted around it.

The better model is:

- project as container
- peer domain objects under the project
- explicit links where the workflow needs them

That produces a system that is easier to evolve, easier to query, and easier to understand.

---

## The Project As A Queryable Knowledge Base

The project should become a structured, queryable source of truth.

That matters because the same project data should answer many natural questions:

- What exactly are we asking this trade to price?
- What was selected for this room?
- Which action items still matter before this mobilization?
- Which files belong to this issue, this project-scope item, or this change?
- What expectations should this trade see before work begins?

The goal is not just a clean budget or a clean sequencer board.

The goal is a project model that is structured enough to support:

- planning
- pricing
- execution
- file context
- operational guidance
- future AI assistance

When the structure is good, the same project can serve builders, field teams, trade partners, and future assistive tooling without inventing separate truths for each audience.

---

## Microsoft Infrastructure Does Not Change The Product Thesis

The product runs on Microsoft infrastructure because that is the operational reality.

That does not change the product's core identity.

The shared thesis remains:

- Microsoft remains the authority for identity and permission intent
- Dataverse remains the authority for business records
- SharePoint remains the authority for files
- the app is the controlled interface that displays, enforces, and normalizes those systems

The product is not "whatever Dataverse happens to look like today."

The product is the shared model the team intentionally defines on top of those systems.

---

## Execution Structure Stays Explicit

Execution structure should not be silently guessed by the app or AI.

Gates provide a time-based structure for major phases of work and for how mobilizations are grouped in the project. Sequencing explains intended flow. Action items and mobilizations help the team coordinate work. None of those layers should be silently reclassified by AI or hidden behind app-local logic.

This product should help the team think and communicate more clearly.

It should not blur the line between:

- truth
- reasoning
- observation

---

## Staged Intelligence

AI in the shared product is staged.

Right now, AI should help with:

- summarizing
- surfacing gaps
- connecting relevant context
- drafting or organizing non-authoritative work

Over time, the same structured project model should support stronger assistance:

- identifying missing scope or coordination gaps
- surfacing relevant files and expectations sooner
- helping newer team members build more complete estimates
- learning from repeated project patterns and unresolved questions

Those future capabilities matter to the vision, but they do not change the current rule: AI must not invent authoritative project truth or execute human authority.

---

## Long-Term Direction

The long-term direction is a construction intelligence platform that remains grounded in real builder workflows.

That platform grows in layers:

1. A clean shared project model.
2. Clear role-specific views into that model.
3. Strong files, expectations, and execution context around that model.
4. Assistive AI that helps the team ask better questions, catch gaps sooner, and work from better context.

The product succeeds if it can make the same project easier to understand, easier to price, easier to coordinate, and easier to trust.
