# AI Strategy

> Status: Authoritative

This document defines how AI fits into the shared product right now, what it may grow into later, and the guardrails that govern both.

---

## Core Principle

AI assists, summarizes, and suggests. It never invents authoritative project data and it never silently rewrites execution structure.

Specifically:

- AI may never silently create, move, or reclassify gate or mobilization structure as authoritative backend state.
- AI may never trigger execution.
- AI may never silently mutate canonical project data.
- AI may never present guessed or inferred content as if it were reviewed backend truth.

Humans remain responsible for decisions that affect real work, real commitments, or real authority boundaries.

---

## Current Approved Role

At the current stage, AI belongs in the information layer.

That includes:

- summarizing project records, selections, scope details, expectations, and sequencing rationale
- surfacing missing information, conflicts, follow-up suggestions, or likely gaps
- helping connect files, project records, and operational context
- drafting non-authoritative text for review

AI is allowed to help the team see more clearly.

It is not allowed to become its own source of truth.

---

## Non-Negotiable Rules

- No AI-generated content should be written into canonical project truth without explicit human review and approval.
- No AI behavior may bypass Microsoft-backed permissions or audience boundaries.
- No AI output may imply that the app has authority beyond Dataverse records, SharePoint files, or declared human execution decisions.
- No AI inference, schedule logic, or summary layer may be interpreted as a gate classification change or mobilization regrouping unless the backend actually records it.
- No AI output may be presented as factual if it is based on missing, uncertain, or incompatible source data.

If the source data is incomplete, AI should say so.

---

## Current Approved Behaviors

- AI may summarize project records, selections, expectations, files, and sequencing rationale.
- AI may highlight missing links, missing context, unresolved issues, or potential contradictions.
- AI may help draft non-authoritative communications, summaries, and review material.
- AI may help a user navigate the project model more quickly by surfacing relevant records and context.
- Any future write path must be explicit, reviewable, logged, and designed so a human remains accountable.

---

## Data Integrity Rules

The shared app must not allow AI to fabricate project truth.

That means AI must not:

- create made-up cost items, files, or execution records and display them as if they already exist
- guess a gate classification, gate state, or mobilization grouping from dates or sequencing data and present it as canonical
- imply that a company assignment, procurement responsibility, or file link exists when it does not
- produce a synthetic project answer that hides the fact that the backend is missing the needed information

AI may draft. AI may suggest. AI may surface gaps.

It may not close the gap by pretending the missing record is already real.

---

## Staged Growth Path

The long-term product should support stronger assistance, but the stages matter.

### Stage 1: Read, summarize, and surface

- summarize project state
- connect records and files
- surface missing context
- help users navigate the system

### Stage 2: Structured drafting

- draft scope or coordination text for review
- draft expectation language from repeated issues
- help package information for trade communication

### Stage 3: Guided assistance

- identify recurring scope gaps
- highlight unresolved questions earlier
- help newer team members build more complete pricing and planning structures

### Stage 4: Learning loops

- observe repeated execution and coordination patterns
- improve suggestions from historical structured data
- help the team catch gaps sooner across future projects

Those later stages belong to the product vision, but they do not weaken the current rules.

---

## Open Implementation Boundaries

This repo still needs future implementation detail on:

- where Microsoft Copilot ends and custom agents begin
- exactly which records may be drafted vs. only summarized
- citation and traceability rules for AI-generated output in the app
- which future write surfaces, if any, should ever move beyond explicit review

Until those details are implemented, default to the conservative posture above.
