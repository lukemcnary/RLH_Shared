# Shared Data Conventions

> Status: Authoritative

This document defines naming standards and data conventions for the combined Microsoft app.

`DOMAIN_MODEL.md` defines what objects exist. `SCHEMA_PLAN.md` defines how the shared product intends to store them in Dataverse. This document defines how the app should refer to those objects in code.

Important boundary:

- the core reference docs describe the **target shared model**
- the checked-in app may still expose some **legacy compatibility types** while current Trevor execution surfaces remain in use

---

## Two Layers of Names

There are two naming layers in this system:

1. **Dataverse names** — the actual field and table names in the API such as `cr6cd_mobilizationid` or `_rlh_projectgate_value`
2. **Domain names** — the clean TypeScript names used above the Dataverse adapter such as `mobilizationId` or `gateId`

**The rule:** Dataverse names only appear in `lib/dataverse/`. Everything above that layer uses domain names.

Current terminology note:

- `Project Scope` is still represented by the `ScopeItem` TypeScript type in the checked-in app.
- `Action Item` is still represented by the `Task` TypeScript type in the checked-in app.
- This preserves existing code and database structure while the shared language shifts at the product level.

---

## Dataverse Naming Conventions

### Prefixes

| Prefix | Owner | Used for |
|---|---|---|
| `cr6cd_` | Trevor | Core custom tables and fields |
| `cr720_` | Trevor | Older custom fields |
| `rlh_` | Rangeline Homes publisher | Shared target tables plus some Trevor-era custom tables |
| No prefix | System | Standard Dataverse tables such as `accounts`, `contacts` |

### Field name patterns

| Pattern | Meaning | Example |
|---|---|---|
| `[prefix]_[entity]id` | Primary key | `cr6cd_mobilizationid`, `rlh_taskid` |
| `_[prefix]_[nav]_value` | Lookup GUID | `_rlh_project_value`, `_cr6cd_buildphase_value` |
| `[prefix]_[nav]@odata.bind` | Bind expression for writes | `rlh_Project@odata.bind` |
| `[prefix]_[fieldname]` | Regular field | `cr6cd_why`, `rlh_lockstatus` |
| `createdon`, `modifiedon` | System timestamps | No custom prefix |

### Picklist values

All Dataverse option set values in this environment use the `936880000` base with sequential integers.

---

## Domain (TypeScript) Naming Conventions

### General rules

- use `camelCase` for field names
- use singular nouns for type names
- primary keys are named `id`
- foreign keys are named `[entity]Id`
- timestamps are `createdAt`, `updatedAt`
- booleans use `is[Thing]`

### Target shared domain object -> type mapping

| Domain Object | TypeScript Type | Notes |
|---|---|---|
| Project | `Project` | |
| Gate / Project Gate | `Gate` | Domain code says `Gate`, not `BuildPhase` |
| Knowledge Entry | `KnowledgeEntry` | Scoped org/project record |
| Trade Type | `TradeType` | |
| Capability | `Capability` | Narrow specialization under a trade type |
| Company | `Company` | |
| Company Type | `CompanyType` | Canonical participation label |
| Company Company Type | `CompanyCompanyType` | Junction type |
| Company Trade Type | `CompanyTradeType` | Junction type |
| Company Capability | `CompanyCapability` | Junction type with rating |
| Contact | `Contact` | |
| Contact Role | `ContactRole` | Canonical role label |
| Client | `Client` | |
| Project Contact | `ProjectContact` | Junction type with optional role |
| Space | `Space` | |
| Cost Code | `CostCode` | |
| Scope Detail | `ScopeDetail` | |
| Project Scope | `ScopeItem` | Primary planning/work-continuity object |
| Cost Item | `CostItem` | Derived financial record |
| Selection | `Selection` | |
| Bid Package | `BidPackage` | |
| Quote | `Quote` | |
| Action Item | `Task` | Shared execution coordination record |
| Mobilization | `Mobilization` | Time container |
| Change Order | `ChangeOrder` | |
| RFI | `Rfi` | Lowercase `fi` |
| File | `ProjectFile` | Avoid collision with browser `File` |
| File Link | `ProjectFileLink` | |
| Expectation | `Expectation` | Org-level behavioral standard |
| Project Expectation | `ProjectExpectation` | Junction with overrides |

### Legacy compatibility types

These types may still exist in the checked-in app while Trevor compatibility surfaces remain in use.

| Compatibility object | TypeScript Type | Notes |
|---|---|---|
| Project Trade | `ProjectTrade` | Thin junction / current board grouping helper |
| Mobilization Marker | `MobilizationMarker` | Compatibility-only marker shape |
| Trade Scope | `TradeScope` | Trevor prep compatibility type |
| Trade Item | `TradeItem` | Trevor prep compatibility type |
| Trade Template | `TradeTemplate` | Trevor template compatibility type |

### Joined / view types

When a query joins related records, suffix with `With[Related]`.

```ts
type GateWithMobilizations = Gate & { mobilizations: Mobilization[] }
type TaskWithLinks = Task & { scopeItem?: ScopeItem; costItem?: CostItem }
type BidPackageWithQuotes = BidPackage & { quotes: Quote[] }
```

### Status / state values

Status fields use string literals in TypeScript. The adapter maps them from Dataverse integers.

| Type | TypeScript values |
|---|---|
| `Project.status` | `'planning' | 'active' | 'complete' | 'on_hold'` |
| `Client.status` | `'new' | 'contacted' | 'qualified' | 'agreement_signed' | 'converted'` |
| `KnowledgeEntry.scope` | `'organization' | 'project'` |
| `Gate.lockStatus` | `'unlocked' | 'soft_lock' | 'hard_lock'` |
| `Gate.declarationStatus` | `'not_open' | 'open' | 'closed'` |
| `CostItem.status` | `'pending' | 'scoped' | 'in_bid' | 'awarded' | 'in_progress' | 'complete'` |
| `CostItem.source` | `'manual' | 'from_scope_item' | 'from_ai'` |
| `Selection.status` | `'pending' | 'specified' | 'approved' | 'ordered' | 'delivered' | 'installed'` |
| `Selection.procurementResponsibility` | `'builder' | 'trade' | 'vendor'` |
| `BidPackage.status` | `'draft' | 'sent' | 'reviewing' | 'awarded'` |
| `Quote.status` | `'pending' | 'accepted' | 'rejected'` |
| `Mobilization.status` | `'draft' | 'confirmed' | 'in_progress' | 'complete'` |
| `Task.status` | `'open' | 'in_progress' | 'complete' | 'blocked'` |
| `ScopeDetail.detailType` | `'specification' | 'coordination' | 'note' | 'dimension'` |
| `ChangeOrder.direction` | `'trade_to_builder' | 'builder_to_client' | 'internal'` |
| `ChangeOrder.status` | `'draft' | 'submitted' | 'approved' | 'rejected'` |
| `Rfi.status` | `'open' | 'answered' | 'closed'` |
| `Expectation.category` | `'general' | 'communication' | 'site_conditions' | 'preparation_coordination' | 'quality_standards'` |
| `ProjectExpectation.source` | `'auto' | 'manual'` |
| `CompanyCapability.rating` | `'unknown' | 'basic' | 'competent' | 'strong' | 'preferred'` |
| `ProjectTrade.stage` | `'planned' | 'in_progress' | 'complete'` |

---

## File & Folder Structure (App)

This block describes the current checked-in app structure. Some target shared surfaces in the domain model are not full project routes yet.

```text
app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── contacts/
│   ├── files/
│   ├── leads/
│   ├── messages/
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── budget/
│   │       ├── cost-items/
│   │       ├── scope-items/
│   │       ├── bid-packages/
│   │       ├── estimate/
│   │       ├── communication/
│   │       ├── change-orders/
│   │       ├── expectations/
│   │       ├── sequencer/
│   │       ├── tasks/
│   │       ├── files/
│   │       ├── development/   (legacy redirects only, if present)
│   │       └── execution/     (legacy redirects only, if present)
├── components/
├── features/
├── lib/
│   ├── constants.ts
│   ├── format.ts
│   ├── mock-data.ts
│   └── dataverse/
│       ├── client.ts
│       ├── adapter.ts
│       └── queries/
│   └── sharepoint/
│       ├── client.ts
│       ├── config.ts
│       └── project-files.ts
└── types/
    └── database.ts
```

Target shared routes such as `scope-details`, `selections`, and `rfis` are defined in the reference docs even when they are not full checked-in project routes yet.

---

## Adapter Layer Rules

1. Dataverse field names only appear in `lib/dataverse/`.
2. Every query function transforms raw OData into domain types before returning.
3. Every mutation function transforms domain data into OData payloads before sending.
4. Picklist integers map to string literals in the adapter only.
5. Compatibility tables should normalize toward the shared target model whenever possible.

---

## Compatibility Naming Rule

When a current Trevor type survives only for bridge purposes:

- keep the existing compatibility type name in code if the checked-in app still needs it
- mark it clearly in docs as compatibility-only
- avoid introducing that legacy term into new shared domain code unless there is no clean alternative
