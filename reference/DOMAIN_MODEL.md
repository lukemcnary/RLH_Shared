# Rangeline Homes — Shared Domain Model

> Status: Authoritative

## Purpose

This document defines the core business records of the Rangeline Homes construction system and how they relate to each other.

It is the constitutional foundation for the combined Microsoft-backed product documented in this repo.

This document describes the system at the **domain level**. It defines what the major records mean and how they should behave, independent of the current Trevor schema or any temporary compatibility layer.

---

## Core Philosophy

The system is built around a **scope-first, project-centered construction model with explicit execution classification**.

Development, Execution, and Admin are useful ways to group project work in the UI, but they are not separate data layers:

- planning/commercial work shapes the project through scope details, project scope, selections, bidding, and optional cost items
- delivery work carries that same project intent into the field through action items created from project scope or directly, grouped into mobilizations and gates
- admin work keeps files, changes, questions, and reference context tied to the same project container

The best way to think about the shared model is:

- **Project** is the container
- scope details, project scope, cost items, selections, bid packages, quotes, action items, mobilizations, and admin records are **first-class project records**
- **project scope** is the planning and work-continuity center
- **cost items** become the financial control center once created
- those records should be **linked correctly**, but they should not all be forced through one mandatory workflow path

Some links are structural and usually expected:

- mobilization -> project
- mobilization -> trade type
- mobilization -> gate classification
- bid package -> project
- quote -> bid package
- action item -> project
- action item -> trade type
- action item -> mobilization

Some links are intentionally optional and workflow-driven:

- action item -> project-scope item
- action item -> cost item
- action item -> company
- cost item -> company
- bid package -> company
- mobilization -> company

This flatter structure is intentional.

The model should not force every object to inherit its meaning through one stricter execution hierarchy. A project contains many important kinds of records, and those records often need to relate across planning, commercial, execution, and admin concerns at the same time.

**Gates** are a high-level execution classification used on mobilizations. A gate represents a major time-based phase of work and helps organize project timing and sequencing. Gate changes should stay explicit in backend workflows rather than being guessed by AI or app-local logic.

Trevor's current Dataverse tables are important source material, but they are not the constitutional definition of the shared product. The shared domain model may keep, simplify, or replace current Dataverse concepts if that produces a better long-term system.

---

## Reading This Model

Read this as a record-and-relationship model, not a workflow diagram.

- `Projects` are the central project-scoped record.
- Shared vocab and reference records sit beside projects, not above fake workflow layers.
- Company and people records connect into projects where needed.
- Many-to-many relationship tables are documented later in this file and in the schema plan, but the main domain view focuses on the major records first.

---

## Core Records And Supporting Concepts

Most entries below correspond to first-class records or tables.

`Organization scope` and `Gate Classification` are included because they shape how records are scoped and interpreted, but they are not rendered as peer record tables in the main domain diagram.

### Organization Scope

An organization represents the builder company using the system.

An organization owns:

- projects
- companies
- contacts
- trade types
- capabilities
- cost codes
- knowledge entries
- expectations

All records ultimately belong to an organization, directly or through a project.

---

### Trade Type

Trade types represent categories of construction work. They are the canonical trade vocabulary for the system.

Examples: framing, electrical, plumbing, drywall, tile, painting.

Trade types are org-level canonical data. They are defined once and reused everywhere.

Trade types classify:

- companies
- capabilities
- project scope
- action items
- cost items
- bid packages
- mobilizations
- project-trade junctions

---

### Capability

A capability represents a narrow specialization within a trade type.

Examples: Ductwork (HVAC), Hydronic Heat (HVAC), Heat Pumps (HVAC), Rough-In (Electrical), Tile Setting (Tile), Cabinet Install (Millwork).

Capabilities are org-level canonical data. They are defined once and reused across all companies and projects.

Every capability belongs to exactly one trade type. Trade types are large buckets; capabilities are the specific things a company can do within that bucket.

Companies link to capabilities through a junction that includes a proficiency rating, so the system can track not just what a company does but how strong they are at each specialization.

---

### Cost Code

Cost codes provide a hierarchical classification system for construction costs.

Cost codes classify cost items but do not contain them. They exist to summarize, compare, and analyze financial scope.

---

### Knowledge Entry

A knowledge entry is a reusable knowledge record stored in one scoped system.

Knowledge entries may be:

- **org-wide** — reusable standards, SOPs, specifications, quality expectations, company practices
- **project-specific** — knowledge that matters only for one job, such as custom details, project-specific lessons, or project coordination references

Knowledge entries are reference material. They are not the main active workflow object for prep or execution. Active planning and coordination belong in project scope, action items, mobilizations, and project admin records.

---

### Expectation

An expectation is a short, actionable behavioral standard for how work should be performed, coordinated, or quality-checked on a construction project.

Expectations are:

- short (1-2 sentences)
- actionable and enforceable
- based on real field experience, not theory
- designed to prevent known issues, clarify assumptions, and improve coordination

Expectations are org-level canonical data. They are defined once and reused across projects.

Each expectation belongs to exactly one category:

- General
- Communication
- Site Conditions
- Preparation & Coordination
- Quality Standards

An expectation is optionally scoped to a trade type. If no trade type is set, the expectation applies to all trades.

**How expectations differ from other domain objects:**

- **Knowledge Entries** are passive reference material. Expectations are active operational guidance.
- **Scope Details** are design-derived facts about what to build. Expectations describe how to operate.
- **Action Items** are work items with completion status. Expectations are ongoing standards, not things to check off.

The expectations library evolves over time. When an issue occurs in the field due to a mismatch in expectations, a new expectation should be added.

---

### Company

A company represents a business entity involved in construction.

Examples:

- subcontractors
- vendors
- suppliers
- architects
- designers
- client companies

A company may be involved in multiple projects.

Companies can be linked to one or more trade types, one or more capabilities (with proficiency ratings), and one or more company types.

---

### Contact

A contact represents a person connected to a company.

Examples: estimator, PM, superintendent, salesperson, architect rep.

Contacts belong to companies and represent the people the builder works with.

---

### Contact Role

Contact roles define the role labels a contact can hold, such as project manager, superintendent, estimator, or principal.

These are canonical org-level values.

---

### Client

A client represents a lead, prospect, or homeowner.

Clients are separate from business contacts. When a project is created, the client becomes the customer record tied to that project.

---

### Project

A project represents a single construction job.

Projects are the primary container for all project-specific information.

A project contains:

- spaces
- scope details
- project scope
- optional cost items
- selections
- bid packages
- quotes
- action items
- mobilizations
- change orders
- RFIs
- files
- project-specific knowledge entries

All operational data ultimately exists within the context of a project.

---

### Gate Classification

A gate represents a major sequential, time-based classification of construction work.

In the shared model, gates are used explicitly on mobilizations to communicate where work sits in the overall timeline.

**Standard five gates in v1:**

1. Site & Pre-Structure Complete
2. Structure Complete
3. Enclosure & Systems Complete
4. Finishes Complete
5. Closeout & Warranty Mode

In v1:

- mobilizations classify into one gate explicitly rather than by app-local inference
- the gate vocabulary stays consistent across projects

Gates help organize execution communication and sequencing. They are not budgets, generic status badges, or a substitute for the other project records linked around the work.

---

### Space

A space represents a physical area or zone within a project.

Examples: Kitchen, Primary Bathroom, Garage, Exterior Front, Mechanical Room.

Spaces are project-specific and flat. They provide the location dimension for planning and execution.

---

### Scope Detail

A scope detail is an atomic fact captured from plans or specifications.

Each scope detail represents one piece of information:

- a material requirement
- a dimension
- a coordination note
- a construction note

Scope details answer the question: "What does the drawing or spec say?"

Scope details are first-class project records. They are not children of cost items.

---

### Project Scope Item

A project scope item is a key planning record in the project's planning/commercial workflow.

It is a trade-specific work description built by stitching together one or more scope details into language that a specific trade can act on.

Each project-scope item belongs to:

- one project
- one trade type

Project-scope items may link to:

- many scope details
- many spaces
- many bid packages
- zero or more cost items
- zero or more action items

Project scope is where planning intent becomes actionable. It is the planning center of the shared product.

Project scope is also the main cross-phase work object of the shared product. The same project-scope item can stay linked through pricing, bidding, action-item creation, and field coordination without being rebuilt in a different record type.

Cross-trade intent may exist in the raw design material, but once ownership matters it should split into separate trade-specific project-scope items.

---

### Cost Item

A cost item is the financial tracking record for scoped work or supply within a project.

Examples:

- supply kitchen appliances
- install kitchen appliances
- install electrical rough-in
- provide waterproofing labor

Cost items are **derived when pricing or financial control is needed**. A project does not need to create cost items before the scope is mature enough to price.

Cost items may include:

- cost code
- trade type
- assigned company
- quantity and unit
- estimate range
- quoted cost
- awarded cost

Cost items are always project-specific. They become the financial control center for the scoped work they represent once they are created.

A company may be linked directly to a cost item when the team already knows who is expected to do the work. That link is helpful, but it is not required before bidding.

---

### Selection

Selections represent products, finishes, fixtures, or materials chosen during a project.

Selections are separate from cost items. One selection may affect multiple cost items and multiple action items.

Selections may track procurement responsibility:

- builder
- trade
- vendor

---

### Bid Package

A bid package is the commercial package sent to bidders for a set of trade-specific work on a project.

A bid package belongs to one project and one trade type.

Bid packages group the work being priced. In the shared model, they may group project scope directly and may also carry cost-item links when financial detail is already available.

A bid package may also carry a direct company assignment when the builder already knows who should get the work and does not need a formal competitive bid.

Bid packages move through a lifecycle such as draft, sent, reviewing, and awarded.

---

### Quote

A quote represents a company's pricing response to a bid package.

Quotes track the bidder, amount, status, and submission timing.

An accepted quote can populate or confirm the assigned company for that commercial package. It is an important assignment path, but it is not the only valid way to assign a company in the shared model.

---

### Project Trade Junction

Project-trade junction records connect a project to the trade types that matter on that job.

They support grouping, filtering, and compatibility with current execution views.

---

### Mobilization

A mobilization represents a specific trade visit to perform work.

A mobilization is a **time container**. It defines when a crew shows up, what they are there to accomplish, and why the timing matters.

Mobilizations belong to one project, one trade type, and one gate classification.

Mobilizations group the action items expected during that visit. Project-scope records remain upstream planning records and connect into sequencing through action-item creation rather than by sitting inside mobilizations directly.

Mobilizations may link directly to a company when the assigned trade partner is already known, or they may pick up that company context from bid-package and quote relationships.

A mobilization may carry compatibility links to Trevor's current execution structures, but in the shared model it remains conceptually simple: a scheduled trade visit with explicit timing and gate classification.

---

### Action Item

Action items represent the execution work units, follow-up items, and checkpoint records tied to a project.

Action items are created when the team starts putting the schedule together. They may be created from a project-scope item or created directly when there is no project-scope source.

Examples:

- confirm beam pocket dimension
- install cabinet blocking
- verify waterproofing inspection
- homeowner final hardware decision needed

Each action item belongs to:

- one project
- one trade type
- one mobilization

Action items may optionally link to:

- one company
- one project-scope item
- one cost item
- one parent action item

Action items represent execution coordination, not just financial scope. Some action items will never need a cost-item link, and some will never need a project-scope link. If an action item is created from scoped work, it should keep that project-scope link so planning intent survives into execution.

**Markers** are action items with an `is_marker` flag. A marker represents a checkpoint event, not ongoing work.

The rule:

- if work continues after the moment, use a marker
- if work stops, create a new action-item boundary

---

### Change Order

A change order represents a scope or cost change after initial agreement.

Change orders may be trade-driven, client-driven, or internal.

---

### RFI

An RFI represents a formal question or clarification request related to project documents or scope.

RFIs may affect project scope, cost items, selections, or field execution.

---

### File

Files represent documents or media associated with project records.

Examples: drawings, photos, submittals, installation instructions, invoices, specification sheets.

The file record stores metadata. File bytes live in external storage.

---

### Project Expectation

A project expectation is a junction record that links an expectation from the org-level library to a specific project.

Project expectations support:

- selecting which expectations apply to a project
- overriding wording for a specific job (custom text)
- controlling document order and inclusion

When trades are assigned to a project, active expectations for those trades and all general expectations are automatically populated as project expectation rows. The PM then reviews, removes, reorders, and customizes wording as needed.

---

## Key Relationships

```text
Organization -> many Projects
Organization -> many Companies
Organization -> many Trade Types
Organization -> many Cost Codes
Organization -> many Knowledge Entries
Organization -> many Capabilities
Organization -> many Expectations

Expectation -> optional Trade Type
Project -> many ProjectExpectations (junction with overrides)
ProjectExpectation -> one Expectation
ProjectExpectation -> one Project

Capability -> one Trade Type
Company -> many Trade Types (junction)
Company -> many Capabilities (junction with rating)

Knowledge Entry -> optional Project

Client -> optional Project
Project -> one Client

Project -> many Spaces
Project -> many Scope Details
Project -> many Project Scope items
Project -> many Cost Items
Project -> many Selections
Project -> many Bid Packages
Project -> many Action Items
Project -> many Mobilizations
Project -> many Change Orders
Project -> many RFIs
Project -> many Files
Project -> many ProjectTrade junction rows

Mobilization -> one Trade Type
Mobilization -> one Gate Classification
Mobilization -> many Action Items

Action Item -> one Trade Type
Action Item -> one Mobilization
Action Item -> optional Company
Action Item -> optional Project Scope item
Action Item -> optional Cost Item
Action Item -> optional parent Action Item

Scope Detail -> many Project Scope items (junction: scope_item_scope_details)
Scope Detail -> many Trade Types (junction: scope_detail_trade_types)
Scope Detail -> many Spaces (junction: scope_detail_spaces)

Project Scope item -> one Trade Type
Project Scope item -> many Scope Details (junction: scope_item_scope_details)
Project Scope item -> many Spaces (junction: scope_item_spaces)
Project Scope item -> many Bid Packages (junction: bidpackage_scopeitems)
Project Scope item -> zero or more Cost Items (junction: costitem_scopeitems)
Project Scope item -> zero or more Action Items

Cost Item -> one Cost Code
Cost Item -> one Trade Type
Cost Item -> optional Company
Cost Item -> many Project Scope items (junction: costitem_scopeitems)
Cost Item -> many Selections (junction: selection_costitems)
Cost Item -> zero or more Action Items

Selection -> many Cost Items (junction: selection_costitems)
Selection -> many Spaces (junction: selection_spaces)

Bid Package -> one Trade Type
Bid Package -> one Project
Bid Package -> optional Company
Bid Package -> many Quotes
Bid Package -> one or more Project Scope items (junction: bidpackage_scopeitems)
Bid Package -> optional Cost Item links (junction: bidpackage_costitems)

Quote -> one Company
Quote -> one Bid Package
Quote -> optional line items per Cost Item (junction: quote_costitems)

Mobilization -> optional Company

ProjectTrade junction -> one Project
ProjectTrade junction -> one Trade Type
```

---

## Complete Table List

These headings are navigational only. They do not imply that one group contains or owns another.

### Shared Vocabulary

- trade_types
- capabilities
- cost_codes
- knowledge_entries
- expectations

### Company And People Records

- companies
- company_types
- company_trade_types *(junction)*
- company_capabilities *(junction with rating)*
- company_company_types *(junction)*
- contacts
- contact_roles
- clients
- project_contacts *(junction)*

### Core Project Records

- projects
- spaces

### Planning And Cost Records

- scope_details
- project_scope
- cost_items
- scope_detail_trade_types *(junction)*
- scope_detail_spaces *(junction)*
- scope_item_scope_details *(junction)*
- scope_item_spaces *(junction)*
- scope_item_cost_items *(junction)*
- cost_item_spaces *(junction)*
- selections
- selection_cost_items *(junction)*
- selection_spaces *(junction)*

### Commercial Records

- bid_packages
- bid_package_scope_items *(junction)*
- bid_package_cost_items *(optional junction)*
- quotes
- quote_cost_items *(optional junction)*

### Execution Records

- project_trades *(junction / compatibility)*
- mobilizations
- scope_items
- legacy_build_phases *(compatibility)*
- legacy_trade_scopes *(compatibility)*
- legacy_trade_items *(compatibility)*
- legacy_mobilization_markers *(compatibility)*

### Administrative Records

- change_orders
- rfis
- files
- file_links
- project_expectations *(junction with overrides)*
