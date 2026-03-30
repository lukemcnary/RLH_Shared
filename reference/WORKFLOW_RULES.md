# Shared Workflow Rules

> Status: Authoritative

This document defines how domain objects behave and move through their lifecycle.

---

## Purpose

Where `DOMAIN_MODEL.md` answers "what are the objects?", this document answers "how do those objects behave?"

Rules here define:

- object lifecycle states and transitions
- what triggers a state change
- what is required before a transition is allowed
- what cannot happen

---

## Core Principle

The shared product follows a **scope-first, project-centered workflow with explicit execution classification**.

The normal project rhythm is:

project setup
-> scope details
-> project scope
-> cost items when pricing is needed
-> bidding and assignment
-> execution through gates, mobilizations, and action items
-> project context through files, expectations, and issue trails

The product should not force every record through one rigid path, but it should preserve that overall shape.

---

## Project Setup

Current rules:

- Project setup creates the container, not the full downstream record graph.
- Spaces, file boundaries, key participant context, and the shared execution vocabulary should exist before detailed planning begins.
- The system should not force cost items or deep execution detail into existence during initial setup.

---

## Scope Details And Project Scope

Current rules:

- Scope details are atomic facts captured from plans and specifications.
- Project-scope items turn those facts into trade-ready work descriptions.
- Project scope is the planning center of the shared product.
- Project-scope items may exist before cost items are created.
- Project-scope items should split into trade-specific ownership when responsibility matters.
- Project scope should stay linked as work moves into bidding, scope-item creation, and field coordination.

---

## Cost Items

Current rules:

- Cost items are always project-specific.
- Budget summaries are derived from cost items; they are not primary records.
- Cost items are created when pricing or financial control is needed, not merely because a project exists.
- Once created, cost items become the main financial tracking record for that scoped work.

---

## Bid Packages

Lifecycle: draft -> sent -> reviewing -> awarded

Current rules:

- Bid packages should start from clear scope, not ambiguous planning notes.
- Bid packages may group project scope first and cost items second, depending on how mature pricing is.
- Direct company assignment is allowed where appropriate; bidding is not the only path to company context.

---

## Selections

Current rules:

- Selections are separate from cost items.
- Selections are separate from project scope too, even when they influence it.
- A selection may affect many cost items.
- Procurement responsibility must be explicit before ordering begins.

---

## Gate Classification

Current rules:

- A gate is a shared execution classification used to organize mobilizations over time.
- Mobilizations should always sit in an explicit gate classification.
- Gate changes should happen explicitly in backend workflows, not through silent AI or UI inference.
- Gate structure should organize execution clearly without pretending to be the only source of project truth.

---

## Mobilizations

Current rules:

- A mobilization belongs to exactly one gate classification.
- A mobilization must explain why that trade is on site at that time.
- A mobilization groups the action items scheduled for that visit; project scope does not sit in mobilizations directly.
- Sequencing is reasoning support, not autonomous job control.

---

## Action Items

Current rules:

- Action items support operational coordination and checkpoints.
- An action item may be created from a project-scope item or created directly.
- An action item must belong to one trade type and one mobilization.
- An action item may optionally link to a company, a project-scope item, a cost item, or a parent action item.
- When an action item describes scoped work, it should link back to the relevant project-scope item.

---

## Files

Current rules:

- SharePoint remains the file system of record.
- Dataverse stores lightweight file references and record links.
- The app may make files easier to browse and connect, but it must not become the file system of record.

---

## Expectations

Current rules:

- Expectations are actionable operating standards, not scope definitions.
- Expectations may be org-level canonical records and project-level curated records.
- Expectation workflows should feed learning and clarity forward without replacing scope or execution structure.

---

## Clients

Lifecycle: new -> contacted -> qualified -> agreement_signed -> converted

When converted, the client is linked to a project.

---

## Change Orders

Directions: Trade -> Builder, Builder -> Client, Internal

---

## Compatibility Boundary

Current rules:

- Bridge-era Trevor surfaces may still participate in the current implementation.
- Bridge behavior must stay explicit in docs and implementation notes.
- Bridge behavior must not silently redefine the target shared workflow.

---

## Remaining Work

This document still needs a full transition matrix for every major object, including required preconditions and forbidden state changes.
