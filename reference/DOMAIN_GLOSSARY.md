# Shared Domain Glossary

> Status: Draft

This document defines the canonical vocabulary for the Rangeline Homes construction system.

The goal is to ensure that the same word means the same thing across the combined product and across all people using it: builders, trade partners, and AI agents.

When a term is used in a shared reference doc, it should be defined here.

---

## Terms

This draft starts with the terms that already matter most. If a term is missing, treat `DOMAIN_MODEL.md` as the authority until this glossary catches up.

| Term | Definition | Notes |
|------|-----------|-------|
| Scope Detail | An atomic fact captured from plans or specifications. The raw building block of planning. | First-class project-level object. |
| Project Scope | A key planning record in the project's planning/commercial workflow. A trade-specific work description built from scope details. | One trade per project-scope item. Can later link to cost items, bid packages, and action items. |
| Cost Item | A financial tracking record for scoped work or supply within a project. | Derived when pricing or financial control is needed. May optionally link to a company when known. |
| Gate | A major sequential, time-based classification of construction work used to organize mobilizations. | Standard shared execution vocabulary used on mobilizations. |
| Mobilization | A specific trade visit to perform work. A time container, not the work itself. | Carries explicit gate classification and groups action items for that trade visit. |
| Action Item | An execution coordination or checkpoint record tied to project work. | Must link to a trade type and mobilization. May optionally link to a company, project-scope item, and cost item. |
| Marker | A checkpoint event represented as an action item with `is_marker = true`. | Use when work continues after the moment. Create a new action-item boundary when work stops. |
| Project Trade | A project-to-trade junction. | Compatibility and grouping helper. |
| Trade Type | A category of construction work such as framing, electrical, or plumbing. | Canonical org-level vocabulary. |
| Capability | A narrow specialization within a trade type, such as Ductwork or Heat Pumps under HVAC. | Org-level. Every capability belongs to exactly one trade type. Companies link to capabilities with a proficiency rating. |
| Expectation | A short, actionable behavioral standard for how work should be performed, coordinated, or quality-checked. Based on field experience, not design documents. | Org-level. Optionally scoped to a trade type. Selected per-project with optional wording overrides. |
| Knowledge Entry | A reusable knowledge record stored in one scoped system. | May be org-wide or project-specific. |
| Selection | A product, finish, fixture, or material chosen during a project. | May affect many cost items and action items. |
| Bid Package | The commercial package sent to bidders for a set of trade-specific work. | May optionally carry a direct company assignment, with or without a formal bid. |
| Quote | A company's pricing response to a bid package. | An accepted quote can populate or confirm company assignment. |
| Build Phase | Trevor's current Dataverse term for his gate-related table. | Compatibility term, not the shared target vocabulary. |
