# Rangeline Homes — Dataverse Schema Plan

> Status: Authoritative

This document defines the **target Dataverse table structure** for the combined Microsoft app.

It is the authoritative source of truth for what the shared product intends to store in Dataverse, what fields those tables contain, and which current Trevor tables are being treated as compatibility surfaces rather than long-term design.

`reference/DOMAIN_MODEL.md` governs what the objects mean. This document governs how the shared product intends to store them.

The checked-in app in `app/` still reads some current Trevor execution tables directly. Where that current implementation differs from the target model, this document calls it out explicitly.

---

## Reading This Document

Each table entry contains:

- **Entity set name** — the OData collection name used in API calls
- **Primary key** — always a GUID field
- **Fields** — field name, type, and purpose
- **Relationships** — lookup fields using the `_[nav]_value` convention
- **Picklist values** — integer codes for option set fields

**Naming prefixes:**

- `cr6cd_` — Trevor's custom tables and fields
- `cr720_` — older Trevor custom prefix
- `rlh_` — Rangeline Homes publisher prefix
- no prefix — Dataverse system tables such as `accounts` and `contacts`

New shared tables continue using the `rlh_` prefix.

---

## Core Design Principles

1. **Projects hold first-class linked records.** Project scope, cost items, bid packages, quotes, action items, mobilizations, and admin records all live under the project and link where needed.
2. **Project scope is the work-continuity record.** Planning often starts with scope details and project scope, and the same project-scope records should stay linked through pricing, bidding, action-item creation, and field coordination.
3. **Cost items are derived when pricing or financial control is needed.** They are not required before the scope is mature enough.
4. **Mobilizations carry explicit gate classification.** Trevor's current `cr6cd_buildphases` table is a compatibility surface; the shared model stores gate classification directly on mobilizations.
5. **Action items support operational coordination.** In sequencing, they are the work units grouped into mobilizations. They may be created from project scope or created directly.
6. **Mobilizations are time containers.** They describe trade visits, group action items, and carry gate classification. They are not the full planning model.
7. **`rlh_projecttrades` remains a project-to-trade link.** It is useful for grouping and compatibility.
8. **Company assignment can be direct or bid-driven.** If the team already knows the company, link it directly. If bidding is used, the accepted quote should populate or confirm that assignment.
9. **Knowledge uses one scoped system.** Org-wide and project-specific knowledge live in the same table.
10. **Trevor's prep, marker, step, and trade-detail tables are compatibility surfaces.** They should not define the shared long-term model.
11. **Do not introduce a permanent work-package layer.** Project scope, bid packages, action items, and mobilizations are sufficient.

---

## Status Meanings

| Status | Meaning |
|---|---|
| **Existing** | Trevor or Dataverse system table that remains part of the long-term shared model. |
| **Extended** | Existing table that stays in the target model but gains shared fields or a tighter interpretation. |
| **Compatibility** | Existing Trevor table or field that the current app may still use, but that is not the desired long-term design center. |
| **New** | Net-new shared table for the target model. |

Changes to Trevor-owned existing or compatibility tables require coordination with Luke and Trevor. Specifically: existing `cr6cd_` tables and current `rlh_` execution tables (`rlh_projecttrades`, `rlh_tradescopes`, `rlh_tradeitems`, `rlh_tradetemplates`) are primarily Trevor-owned. New `rlh_` development and admin tables are owned by the shared product team.

---

## Org-Level

### Trade Types — `cr6cd_trades` *(Existing)*

The canonical list of trade categories. Defined once at the org level and consumed by all project records.

| Field | Type | Notes |
|---|---|---|
| `cr6cd_tradeid` | GUID | Primary key |
| `cr6cd_tradename` | Text | Display name |
| `cr6cd_tradecode` | Text | Short code used in UI chips and grouping |

**OData entity set:** `cr6cd_trades`

---

### Cost Codes — `rlh_costcodes` *(New)*

Hierarchical classification system for construction costs.

| Field | Type | Notes |
|---|---|---|
| `rlh_costcodeid` | GUID | Primary key |
| `rlh_code` | Text | Cost code such as `03-100` |
| `rlh_name` | Text | Display name |
| `rlh_division` | Text | Top-level division |
| `rlh_isscope` | Boolean | True if the code should appear in shared scope/cost pickers |
| `_rlh_parentcostcode_value` | Lookup GUID | Optional parent for hierarchy |
| `_rlh_tradetype_value` | Lookup GUID | Optional default trade classification |

**OData entity set:** `rlh_costcodes`

---

### Knowledge Entries — `rlh_knowledgeentries` *(New)*

One scoped knowledge system for reusable reference material.

| Field | Type | Notes |
|---|---|---|
| `rlh_knowledgeentryid` | GUID | Primary key |
| `rlh_title` | Text | Short title |
| `rlh_content` | Multiline Text | Full knowledge content |
| `rlh_scope` | Picklist | Organization or project |
| `rlh_category` | Text | Optional grouping label |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Optional project when scope is project |
| `_rlh_tradetype_value` | Lookup GUID | Optional trade context |

**Scope picklist:**

| Label | Value |
|---|---|
| Organization | 936880000 |
| Project | 936880001 |

**OData entity set:** `rlh_knowledgeentries`

**Domain rule:** Project-specific knowledge lives here, but active workflow coordination should still happen in action items, mobilizations, RFIs, and change orders.

---

### Capabilities — `rlh_capabilities` *(New)*

Narrow specializations within a trade type. Org-level canonical data.

| Field | Type | Notes |
|---|---|---|
| `rlh_capabilityid` | GUID | Primary key |
| `rlh_name` | Text | Display name such as `Ductwork` or `Hydronic Heat` |
| `rlh_description` | Multiline Text | Optional detail |
| `_rlh_tradetype_value` | Lookup GUID | Required parent trade type |

**Navigation bind:** `rlh_TradeType@odata.bind`

**OData entity set:** `rlh_capabilities`

**Domain rule:** Every capability belongs to exactly one trade type. Trade types are the large bucket; capabilities are the specific things a company can do within that bucket.

---

### Expectations — `rlh_expectations` *(New)*

Short, actionable behavioral standards for how work should be performed. Org-level reusable library.

| Field | Type | Notes |
|---|---|---|
| `rlh_expectationid` | GUID | Primary key |
| `rlh_description` | Multiline Text | Required. 1-2 sentences, actionable |
| `rlh_category` | Picklist | Required category |
| `_rlh_tradetype_value` | Lookup GUID | Optional trade type. Null means applies to all trades |
| `rlh_isactive` | Boolean | Whether this expectation is in the active library |

**Category picklist:**

| Label | Value |
|---|---|
| General | 936880000 |
| Communication | 936880001 |
| Site Conditions | 936880002 |
| Preparation & Coordination | 936880003 |
| Quality Standards | 936880004 |

**OData entity set:** `rlh_expectations`

**Domain rule:** Expectations describe how to operate, not what to build. They are distinct from knowledge entries (passive reference) and scope details (design-derived facts). The library evolves over time as field issues surface new expectations.

---

## Companies & People

### Companies — `accounts` *(Existing — system table)*

Dataverse's standard `accounts` entity is used for companies.

| Field | Type | Notes |
|---|---|---|
| `accountid` | GUID | Primary key |
| `name` | Text | Company name |
| `telephone1` | Text | Primary phone |
| `emailaddress1` | Text | Primary email |
| `websiteurl` | Text | Website |
| `statecode` | Integer | System active/inactive state |

**OData entity set:** `accounts`

---

### Contacts — `contacts` *(Existing — system table)*

Business associates tied to companies.

| Field | Type | Notes |
|---|---|---|
| `contactid` | GUID | Primary key |
| `fullname` | Text | Display name |
| `firstname` | Text | |
| `lastname` | Text | |
| `emailaddress1` | Text | Primary email |
| `mobilephone` | Text | Mobile |
| `jobtitle` | Text | Role at company |
| `parentcustomerid` | Lookup | Company |

**OData entity set:** `contacts`

---

### Clients — `rlh_clients` *(New)*

Homeowners, leads, and prospects.

| Field | Type | Notes |
|---|---|---|
| `rlh_clientid` | GUID | Primary key |
| `rlh_firstname` | Text | |
| `rlh_lastname` | Text | |
| `rlh_email` | Text | |
| `rlh_phone` | Text | |
| `rlh_status` | Picklist | Lead lifecycle status |
| `rlh_notes` | Multiline Text | |

**Status picklist:**

| Label | Value |
|---|---|
| New | 936880000 |
| Contacted | 936880001 |
| Qualified | 936880002 |
| Agreement Signed | 936880003 |
| Converted | 936880004 |

**OData entity set:** `rlh_clients`

---

### Company Types — `rlh_companytypes` *(New)*

Canonical labels for how a company participates in construction.

| Field | Type | Notes |
|---|---|---|
| `rlh_companytypeid` | GUID | Primary key |
| `rlh_name` | Text | Display name such as `Subcontractor`, `Vendor`, `Supplier`, `Architect` |

**OData entity set:** `rlh_companytypes`

---

### Company ↔ Company Type — `rlh_company_companytypes` *(New)*

Junction table linking companies to their type classifications.

| Field | Type | Notes |
|---|---|---|
| `rlh_company_companytypeid` | GUID | Primary key |
| `_rlh_company_value` | Lookup GUID | Company (accounts) |
| `_rlh_companytype_value` | Lookup GUID | Company type |

**OData entity set:** `rlh_company_companytypes`

---

### Contact Roles — `rlh_contactroles` *(New)*

Canonical role labels for contacts such as project manager, superintendent, estimator, or principal.

| Field | Type | Notes |
|---|---|---|
| `rlh_contactroleid` | GUID | Primary key |
| `rlh_name` | Text | Role label |

**OData entity set:** `rlh_contactroles`

---

### Project Contacts — `rlh_projectcontacts` *(New)*

Junction table linking contacts to the projects they participate in.

| Field | Type | Notes |
|---|---|---|
| `rlh_projectcontactid` | GUID | Primary key |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_contact_value` | Lookup GUID | Contact |
| `_rlh_contactrole_value` | Lookup GUID | Optional role on this project |

**OData entity set:** `rlh_projectcontacts`

---

### Company ↔ Trade Type — `rlh_company_tradetypes` *(New)*

Junction table linking companies to their broad trade categories.

| Field | Type | Notes |
|---|---|---|
| `rlh_company_tradetypeid` | GUID | Primary key |
| `_rlh_company_value` | Lookup GUID | Company (accounts) |
| `_rlh_tradetype_value` | Lookup GUID | Trade type |

**OData entity set:** `rlh_company_tradetypes`

---

### Company ↔ Capability — `rlh_company_capabilities` *(New)*

Junction table linking companies to specific capabilities with a proficiency rating.

| Field | Type | Notes |
|---|---|---|
| `rlh_company_capabilityid` | GUID | Primary key |
| `_rlh_company_value` | Lookup GUID | Company (accounts) |
| `_rlh_capability_value` | Lookup GUID | Capability |
| `rlh_rating` | Picklist | Proficiency rating |

**Rating picklist:**

| Label | Value |
|---|---|
| Unknown | 936880000 |
| Basic | 936880001 |
| Competent | 936880002 |
| Strong | 936880003 |
| Preferred | 936880004 |

**OData entity set:** `rlh_company_capabilities`

**Domain rule:** A company's capability rating tracks how strong they are at a specific specialization. This helps PMs choose the right company for narrow work types beyond just knowing their broad trade.

---

## Project Setup

### Projects — `cr6cd_projects` *(Extended)*

The top-level container for all project data. Trevor's existing table remains the project record for the shared product.

| Field | Type | Notes |
|---|---|---|
| `cr6cd_projectid` | GUID | Primary key |
| `cr6cd_projectname` | Text | Display name |
| `cr6cd_startdate` | Date | Project start |
| `cr6cd_enddate` | Date | Target completion |
| `cr6cd_holidaysjson` | Multiline Text | Trevor legacy holiday storage |
| `cr6cd_gatedeclarationsjson` | Multiline Text | Trevor legacy gate declaration storage, compatibility only |
| `rlh_address` | Text | Shared site address |
| `rlh_status` | Picklist | Shared project status |
| `_rlh_client_value` | Lookup GUID | Client |
| `rlh_sharepointsiteurl` | Text | Bound SharePoint site URL for project files |
| `rlh_sharepointsiteid` | Text | Bound SharePoint site ID for Graph operations |

**Status picklist:**

| Label | Value |
|---|---|
| Planning | 936880000 |
| Active | 936880001 |
| Complete | 936880002 |
| On Hold | 936880003 |

**Navigation bind:** `rlh_Client@odata.bind`

**OData entity set:** `cr6cd_projects`

---

### Spaces — `rlh_spaces` *(New)*

Flat project-specific space records.

| Field | Type | Notes |
|---|---|---|
| `rlh_spaceid` | GUID | Primary key |
| `rlh_name` | Text | Space label |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |

**Navigation bind:** `rlh_Project@odata.bind`

**OData entity set:** `rlh_spaces`

---

## Scope & Cost

### Scope Details — `rlh_scopedetails` *(New)*

Atomic facts captured from plans or specifications.

| Field | Type | Notes |
|---|---|---|
| `rlh_scopedetailid` | GUID | Primary key |
| `rlh_content` | Multiline Text | The fact itself |
| `rlh_detailtype` | Picklist | Detail type |
| `rlh_source` | Text | Sheet, spec section, or origin note |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |

**Detail type picklist:**

| Label | Value |
|---|---|
| Specification | 936880000 |
| Coordination | 936880001 |
| Note | 936880002 |
| Dimension | 936880003 |

**OData entity set:** `rlh_scopedetails`

---

### Scope Detail ↔ Trade Type — `rlh_scopedetail_tradetypes` *(New)*

Junction table for multi-trade design facts.

| Field | Type | Notes |
|---|---|---|
| `rlh_scopedetail_tradetypeid` | GUID | Primary key |
| `_rlh_scopedetail_value` | Lookup GUID | Scope detail |
| `_rlh_tradetype_value` | Lookup GUID | Trade type |

---

### Scope Detail ↔ Space — `rlh_scopedetail_spaces` *(New)*

Junction table for scope-detail location context.

| Field | Type | Notes |
|---|---|---|
| `rlh_scopedetail_spaceid` | GUID | Primary key |
| `_rlh_scopedetail_value` | Lookup GUID | Scope detail |
| `_rlh_space_value` | Lookup GUID | Space |

---

### Project Scope — `rlh_scopeitems` *(New)*

The main planning and work-continuity objects. One trade per project-scope item.

| Field | Type | Notes |
|---|---|---|
| `rlh_scopeitemid` | GUID | Primary key |
| `rlh_name` | Text | Short label |
| `rlh_description` | Multiline Text | Trade-ready work description |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_tradetype_value` | Lookup GUID | Trade type |

**Navigation bind:** `rlh_Project@odata.bind`, `rlh_TradeType@odata.bind`

**OData entity set:** `rlh_scopeitems`

**Domain rule:** Project scope stays linked to the work as it moves into pricing, bidding, action-item creation, and field coordination.

---

### Project Scope ↔ Scope Detail — `rlh_scopeitem_scopedetails` *(New)*

Junction table linking trade-ready descriptions back to raw facts.

| Field | Type | Notes |
|---|---|---|
| `rlh_scopeitem_scopedetailid` | GUID | Primary key |
| `_rlh_scopeitem_value` | Lookup GUID | Project-scope item |
| `_rlh_scopedetail_value` | Lookup GUID | Scope detail |

---

### Project Scope ↔ Space — `rlh_scopeitem_spaces` *(New)*

Junction table for scope-item location context.

| Field | Type | Notes |
|---|---|---|
| `rlh_scopeitem_spaceid` | GUID | Primary key |
| `_rlh_scopeitem_value` | Lookup GUID | Project-scope item |
| `_rlh_space_value` | Lookup GUID | Space |

---

### Cost Items — `rlh_costitems` *(New)*

Financial tracking records created when pricing or cost control is needed.

| Field | Type | Notes |
|---|---|---|
| `rlh_costitemid` | GUID | Primary key |
| `rlh_name` | Text | Short description |
| `rlh_description` | Multiline Text | Full scope description |
| `rlh_quantity` | Decimal | |
| `rlh_unit` | Text | Unit such as `SF`, `LF`, `EA`, `LS` |
| `rlh_estimatelow` | Currency | Low estimate |
| `rlh_estimatehigh` | Currency | High estimate |
| `rlh_quotedcost` | Currency | Quoted or awarded amount |
| `rlh_status` | Picklist | Financial lifecycle status |
| `rlh_source` | Picklist | How the record was created |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_costcode_value` | Lookup GUID | Cost code |
| `_rlh_tradetype_value` | Lookup GUID | Trade type |
| `_rlh_company_value` | Lookup GUID | Optional directly assigned company |

**Status picklist:**

| Label | Value |
|---|---|
| Pending | 936880000 |
| Scoped | 936880001 |
| In Bid | 936880002 |
| Awarded | 936880003 |
| In Progress | 936880004 |
| Complete | 936880005 |

**Source picklist:**

| Label | Value |
|---|---|
| Manual | 936880000 |
| From Project Scope | 936880001 |
| From AI Extraction | 936880002 |

**Navigation bind:** `rlh_Project@odata.bind`, `rlh_CostCode@odata.bind`, `rlh_TradeType@odata.bind`, `rlh_Company@odata.bind`

**OData entity set:** `rlh_costitems`

**Domain rule:** Cost items may carry a direct company link when the team already knows who is expected to do the work. If a formal bid package and accepted quote exist, those records should populate or confirm the same company context.

---

### Cost Item ↔ Project Scope — `rlh_costitem_scopeitems` *(New)*

Junction table linking financial records back to planning scope.

| Field | Type | Notes |
|---|---|---|
| `rlh_costitem_scopeitemid` | GUID | Primary key |
| `_rlh_costitem_value` | Lookup GUID | Cost item |
| `_rlh_scopeitem_value` | Lookup GUID | Project-scope item |

---

### Cost Item ↔ Space — `rlh_costitem_spaces` *(New)*

Junction table for cost-item location context.

| Field | Type | Notes |
|---|---|---|
| `rlh_costitem_spaceid` | GUID | Primary key |
| `_rlh_costitem_value` | Lookup GUID | Cost item |
| `_rlh_space_value` | Lookup GUID | Space |

---

### Selections — `rlh_selections` *(New)*

Products, finishes, fixtures, and materials chosen during a project.

| Field | Type | Notes |
|---|---|---|
| `rlh_selectionid` | GUID | Primary key |
| `rlh_name` | Text | Selection label |
| `rlh_description` | Multiline Text | |
| `rlh_manufacturer` | Text | |
| `rlh_modelnumber` | Text | |
| `rlh_speccode` | Text | Optional spec code |
| `rlh_quantity` | Decimal | |
| `rlh_unit` | Text | |
| `rlh_status` | Picklist | Selection status |
| `rlh_procurementresponsibility` | Picklist | Who buys it |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_supplier_value` | Lookup GUID | Optional supplier company |

**Status picklist:**

| Label | Value |
|---|---|
| Pending | 936880000 |
| Specified | 936880001 |
| Approved | 936880002 |
| Ordered | 936880003 |
| Delivered | 936880004 |
| Installed | 936880005 |

**Procurement responsibility picklist:**

| Label | Value |
|---|---|
| Builder | 936880000 |
| Trade | 936880001 |
| Vendor | 936880002 |

**OData entity set:** `rlh_selections`

---

### Selection ↔ Cost Item — `rlh_selection_costitems` *(New)*

Junction table for how product decisions affect financial scope.

| Field | Type | Notes |
|---|---|---|
| `rlh_selection_costitemid` | GUID | Primary key |
| `_rlh_selection_value` | Lookup GUID | Selection |
| `_rlh_costitem_value` | Lookup GUID | Cost item |

---

### Selection ↔ Space — `rlh_selection_spaces` *(New)*

Junction table for where the selection applies.

| Field | Type | Notes |
|---|---|---|
| `rlh_selection_spaceid` | GUID | Primary key |
| `_rlh_selection_value` | Lookup GUID | Selection |
| `_rlh_space_value` | Lookup GUID | Space |

---

## Bidding

### Bid Packages — `rlh_bidpackages` *(New)*

Commercial packages sent to bidders for trade-specific work.

| Field | Type | Notes |
|---|---|---|
| `rlh_bidpackageid` | GUID | Primary key |
| `rlh_name` | Text | Package name |
| `rlh_status` | Picklist | Bid lifecycle |
| `rlh_sentdate` | Date | When sent |
| `rlh_duedate` | Date | Bid due date |
| `rlh_awardeddate` | Date | When award became official |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_tradetype_value` | Lookup GUID | Trade type |
| `_rlh_company_value` | Lookup GUID | Optional directly assigned company |
| `_rlh_awardedquote_value` | Lookup GUID | Accepted quote, optional until award |

**Status picklist:**

| Label | Value |
|---|---|
| Draft | 936880000 |
| Sent | 936880001 |
| Reviewing | 936880002 |
| Awarded | 936880003 |

**OData entity set:** `rlh_bidpackages`

**Domain rule:** A bid package may have a direct company assignment even when no formal quote exists. If an accepted quote exists, it should populate or confirm the same company link.

---

### Bid Package ↔ Project Scope — `rlh_bidpackage_scopeitems` *(New)*

Primary junction table between commercial packages and planned work.

| Field | Type | Notes |
|---|---|---|
| `rlh_bidpackage_scopeitemid` | GUID | Primary key |
| `_rlh_bidpackage_value` | Lookup GUID | Bid package |
| `_rlh_scopeitem_value` | Lookup GUID | Project-scope item |

---

### Bid Package ↔ Cost Item — `rlh_bidpackage_costitems` *(New)*

Optional junction table when the package already has financial breakdown detail.

| Field | Type | Notes |
|---|---|---|
| `rlh_bidpackage_costitemid` | GUID | Primary key |
| `_rlh_bidpackage_value` | Lookup GUID | Bid package |
| `_rlh_costitem_value` | Lookup GUID | Cost item |

---

### Quotes — `rlh_quotes` *(New)*

Company pricing responses to bid packages.

| Field | Type | Notes |
|---|---|---|
| `rlh_quoteid` | GUID | Primary key |
| `rlh_totalamount` | Currency | Total quoted amount |
| `rlh_status` | Picklist | Quote decision status |
| `rlh_submitteddate` | Date | When received |
| `rlh_notes` | Multiline Text | |
| `_rlh_bidpackage_value` | Lookup GUID | Bid package |
| `_rlh_company_value` | Lookup GUID | Bidding company |

**Status picklist:**

| Label | Value |
|---|---|
| Pending | 936880000 |
| Accepted | 936880001 |
| Rejected | 936880002 |

**OData entity set:** `rlh_quotes`

---

### Quote ↔ Cost Item — `rlh_quote_costitems` *(New)*

Optional line-item financial breakdown by cost item.

| Field | Type | Notes |
|---|---|---|
| `rlh_quote_costitemid` | GUID | Primary key |
| `rlh_amount` | Currency | Amount for the cost item |
| `_rlh_quote_value` | Lookup GUID | Quote |
| `_rlh_costitem_value` | Lookup GUID | Cost item |

---

## Execution

### Project Trades — `rlh_projecttrades` *(Compatibility)*

Trevor's existing project-to-trade table. The shared product treats it as a project-to-trade link plus temporary execution grouping surface.

| Field | Type | Notes |
|---|---|---|
| `rlh_projecttradeid` | GUID | Primary key |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_trade_value` | Lookup GUID | Trade type |
| `rlh_newcolumn` | Text | Legacy display label, optional |
| `rlh_externalid` | Text | Legacy external reference |
| `rlh_scopesummary` | Multiline Text | Legacy summary, not authoritative |
| `rlh_notes` | Multiline Text | Legacy notes |
| `rlh_stage` | Picklist | Legacy stage, compatibility only |
| `_cr720_partnerlookup_value` | Lookup GUID | Legacy partner/company link, not authoritative in the target model |

**Stage picklist:**

| Label | Value |
|---|---|
| Planned | 936880000 |
| In Progress | 936880001 |
| Complete | 936880002 |

**Navigation bind:** `rlh_Project@odata.bind`, `rlh_Trade@odata.bind`, `cr720_PartnerLookup@odata.bind`

**OData entity set:** `rlh_projecttrades`

**Domain rule:** Shared code should only rely on the project and trade relationship here unless a compatibility workflow explicitly needs the older Trevor fields.

---

### Mobilizations — `cr6cd_mobilizations` *(Extended)*

Scheduled trade visits. Trevor's table remains the live mobilization record, but the shared model changes what it should point at.

| Field | Type | Notes |
|---|---|---|
| `cr6cd_mobilizationid` | GUID | Primary key |
| `cr6cd_newcolumn` | Text | Display name |
| `cr6cd_why` | Multiline Text | Why this timing matters |
| `cr6cd_startoffset` | Integer | Days from project start |
| `cr6cd_durationdays` | Integer | Total duration in working days |
| `cr6cd_basedurationdays` | Integer | Duration excluding one-off scope |
| `cr6cd_displayorder` | Integer | Sort order within board grouping |
| `cr6cd_notes` | Multiline Text | Notes |
| `cr6cd_stepsjson` | Multiline Text | Trevor legacy step storage, compatibility only |
| `cr6cd_markersjson` | Multiline Text | Trevor legacy marker storage, compatibility only |
| `cr6cd_relocatedscopejson` | Multiline Text | Trevor legacy one-off scope storage |
| `_cr6cd_project_value` | Lookup GUID | Project |
| `_cr6cd_buildphase_value` | Lookup GUID | Trevor legacy gate link, compatibility only |
| `_cr6cd_projecttrade_value` | Lookup GUID | Trevor legacy project-trade link, compatibility only |
| `_cr6cd_trade_value` | Lookup GUID | Trade type |
| `rlh_gatekey` | Picklist | Shared gate classification |
| `_rlh_bidpackage_value` | Lookup GUID | Optional commercial package context |
| `_rlh_company_value` | Lookup GUID | Optional directly assigned company |
| `_rlh_awardedquote_value` | Lookup GUID | Optional accepted quote that can populate or confirm company assignment |
| `rlh_status` | Picklist | Shared mobilization status |

**Status picklist:**

| Label | Value |
|---|---|
| Draft | 936880000 |
| Confirmed | 936880001 |
| In Progress | 936880002 |
| Complete | 936880003 |

**Gate key picklist:**

| Label | Value |
|---|---|
| Site & Pre-Structure Complete | 936880000 |
| Structure Complete | 936880001 |
| Enclosure & Systems Complete | 936880002 |
| Finishes Complete | 936880003 |
| Closeout & Warranty Mode | 936880004 |

**Navigation bind:** `cr6cd_Project@odata.bind`, `cr6cd_BuildPhase@odata.bind`, `cr6cd_ProjectTrade@odata.bind`, `rlh_BidPackage@odata.bind`, `rlh_Company@odata.bind`, `rlh_AwardedQuote@odata.bind`

**OData entity set:** `cr6cd_mobilizations`

**Domain rule:** The shared product should use `rlh_gatekey` as the normalized gate classification. Company context may be linked directly or confirmed through bid-package and quote relationships. Trevor's build-phase and JSON fields remain only for bridge compatibility. Mobilizations group action items; they do not use a direct target-model junction to project scope.

---

### Action Items — `rlh_tasks` *(New)*

Operational coordination and checkpoint records. Markers are action items with a flag.

| Field | Type | Notes |
|---|---|---|
| `rlh_taskid` | GUID | Primary key |
| `rlh_name` | Text | Action-item description |
| `rlh_notes` | Multiline Text | |
| `rlh_ismarker` | Boolean | True for checkpoint events |
| `rlh_status` | Picklist | Action-item state |
| `rlh_duedate` | Date | Optional date |
| `rlh_sortorder` | Integer | Optional display order |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_tradetype_value` | Lookup GUID | Required trade type |
| `_rlh_company_value` | Lookup GUID | Optional assigned company |
| `_rlh_scopeitem_value` | Lookup GUID | Optional source project-scope item |
| `_rlh_costitem_value` | Lookup GUID | Optional financial link |
| `_rlh_mobilization_value` | Lookup GUID | Required mobilization assignment |
| `_rlh_parenttask_value` | Lookup GUID | Optional parent action item |

**Status picklist:**

| Label | Value |
|---|---|
| Open | 936880000 |
| In Progress | 936880001 |
| Complete | 936880002 |
| Blocked | 936880003 |

**OData entity set:** `rlh_tasks`

**Domain rule:** Sequencer action items may be created from a project-scope item or created directly. Every action item must carry a trade type and mobilization assignment. Company, project-scope, and cost-item links are optional. When an action item describes work tied to a project-scope item, it should stay linked to that project-scope item. Action-item trade type should match the mobilization trade type.

---

## Compatibility Surfaces

These Trevor tables and fields may still appear in the checked-in app or optional compatibility logic, but they are not the long-term shared design center.

### Build Phases — `cr6cd_buildphases` *(Compatibility)*

Trevor's current gate-related table. Keep for bridge compatibility only.

### Mobilization Markers — `cr6cd_mobilizationmarkerses` *(Compatibility)*

Trevor's current relational marker table. Shared target model prefers `rlh_tasks` with `rlh_ismarker = true`.

### Trade Scopes — `rlh_tradescopes` *(Compatibility)*

Trevor's prep / scoped-work table. Useful legacy reference when needed, not a long-term shared planning backbone.

### Trade Items — `rlh_tradeitems` *(Compatibility)*

Trevor's granular prep / decision / question / action / risk items. Useful legacy reference when needed, not the long-term shared workflow object.

### Trade Templates — `rlh_tradetemplates` *(Compatibility)*

Trevor's reusable trade-item templates. Preserve as optional legacy context until the shared action-item and knowledge systems fully replace the need.

---

## Project Admin

### Change Orders — `rlh_changeorders` *(New)*

First-class change order records.

| Field | Type | Notes |
|---|---|---|
| `rlh_changeorderid` | GUID | Primary key |
| `rlh_name` | Text | Short description |
| `rlh_description` | Multiline Text | Full description |
| `rlh_direction` | Picklist | Who initiated |
| `rlh_status` | Picklist | Lifecycle |
| `rlh_amount` | Currency | Cost impact |
| `rlh_requesteddate` | Date | |
| `rlh_approveddate` | Date | |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |

**Direction picklist:**

| Label | Value |
|---|---|
| Trade -> Builder | 936880000 |
| Builder -> Client | 936880001 |
| Internal | 936880002 |

**Status picklist:**

| Label | Value |
|---|---|
| Draft | 936880000 |
| Submitted | 936880001 |
| Approved | 936880002 |
| Rejected | 936880003 |

**OData entity set:** `rlh_changeorders`

---

### RFIs — `rlh_rfis` *(New)*

Formal project questions and clarifications.

| Field | Type | Notes |
|---|---|---|
| `rlh_rfiid` | GUID | Primary key |
| `rlh_number` | Integer | Project-sequential RFI number |
| `rlh_subject` | Text | Subject line |
| `rlh_question` | Multiline Text | The question |
| `rlh_response` | Multiline Text | The answer |
| `rlh_status` | Picklist | Lifecycle |
| `rlh_duedate` | Date | Response due |
| `rlh_respondeddate` | Date | When answered |
| `_rlh_project_value` | Lookup GUID | Project |
| `_rlh_submittedby_value` | Lookup GUID | Optional contact |

**Status picklist:**

| Label | Value |
|---|---|
| Open | 936880000 |
| Answered | 936880001 |
| Closed | 936880002 |

**OData entity set:** `rlh_rfis`

---

### Files — `rlh_files` *(New)*

File metadata only. File bytes live in SharePoint.

| Field | Type | Notes |
|---|---|---|
| `rlh_fileid` | GUID | Primary key |
| `rlh_filename` | Text | Display name |
| `rlh_librarykey` | Text | Canonical project library key |
| `rlh_sharepointurl` | Text | Full SharePoint URL |
| `rlh_sharepointsiteid` | Text | SharePoint site ID |
| `rlh_sharepointdriveid` | Text | SharePoint drive/library ID |
| `rlh_sharepointitemid` | Text | SharePoint item ID |
| `rlh_filetype` | Text | MIME type or extension |
| `rlh_filesize` | Integer | Bytes |
| `rlh_notes` | Multiline Text | |
| `_rlh_project_value` | Lookup GUID | Project |
| `createdon` | DateTime | System timestamp |

**OData entity set:** `rlh_files`

---

### File Links — `rlh_filelinks` *(New)*

Polymorphic junction for attaching files to project records.

| Field | Type | Notes |
|---|---|---|
| `rlh_filelinkid` | GUID | Primary key |
| `rlh_linkedrecordtype` | Text | Entity set name of linked record |
| `rlh_linkedrecordid` | Text | GUID of linked record, stored as text for polymorphism |
| `rlh_linkedrecordlabel` | Text | Optional UI label for linked record |
| `_rlh_file_value` | Lookup GUID | File metadata row |

**OData entity set:** `rlh_filelinks`

---

### Project Expectations — `rlh_projectexpectations` *(New)*

Junction table linking expectations from the org-level library to a specific project, with inclusion, custom text override, sort order, and source tracking.

| Field | Type | Notes |
|---|---|---|
| `rlh_projectexpectationid` | GUID | Primary key |
| `_rlh_project_value` | Lookup GUID | Required project |
| `_rlh_expectation_value` | Lookup GUID | Required expectation |
| `rlh_isincluded` | Boolean | Whether included in this project's expectations document |
| `rlh_customtext` | Multiline Text | Optional override wording for this project |
| `rlh_sortorder` | Integer | Display order within the generated document |
| `rlh_source` | Picklist | How this row was created |

**Source picklist:**

| Label | Value |
|---|---|
| Auto | 936880000 |
| Manual | 936880001 |

**OData entity set:** `rlh_projectexpectations`

**Domain rule:** When trades are assigned to a project, all active general expectations and all active expectations for the assigned trades are automatically created as project expectation rows with source = Auto. The PM then curates: toggling inclusion, overriding wording, and reordering as needed.

---

## Complete Table List

### Org-Level

| Table | Status |
|---|---|
| `cr6cd_trades` | Existing |
| `rlh_capabilities` | New |
| `rlh_costcodes` | New |
| `rlh_knowledgeentries` | New |
| `rlh_expectations` | New |

### Companies & People

| Table | Status |
|---|---|
| `accounts` | Existing |
| `contacts` | Existing |
| `rlh_clients` | New |
| `rlh_companytypes` | New |
| `rlh_company_companytypes` | New |
| `rlh_company_tradetypes` | New |
| `rlh_company_capabilities` | New |
| `rlh_contactroles` | New |
| `rlh_projectcontacts` | New |

### Project Setup

| Table | Status |
|---|---|
| `cr6cd_projects` | Extended |
| `rlh_spaces` | New |

### Scope & Cost

| Table | Status |
|---|---|
| `rlh_scopedetails` | New |
| `rlh_scopedetail_tradetypes` | New |
| `rlh_scopedetail_spaces` | New |
| `rlh_scopeitems` | New |
| `rlh_scopeitem_scopedetails` | New |
| `rlh_scopeitem_spaces` | New |
| `rlh_costitems` | New |
| `rlh_costitem_scopeitems` | New |
| `rlh_costitem_spaces` | New |
| `rlh_selections` | New |
| `rlh_selection_costitems` | New |
| `rlh_selection_spaces` | New |

### Bidding

| Table | Status |
|---|---|
| `rlh_bidpackages` | New |
| `rlh_bidpackage_scopeitems` | New |
| `rlh_bidpackage_costitems` | New |
| `rlh_quotes` | New |
| `rlh_quote_costitems` | New |

### Execution

| Table | Status |
|---|---|
| `rlh_projecttrades` | Compatibility |
| `cr6cd_mobilizations` | Extended |
| `rlh_tasks` | New |
| `cr6cd_buildphases` | Compatibility |
| `cr6cd_mobilizationmarkerses` | Compatibility |
| `rlh_tradescopes` | Compatibility |
| `rlh_tradeitems` | Compatibility |
| `rlh_tradetemplates` | Compatibility |

### Project Admin

| Table | Status |
|---|---|
| `rlh_changeorders` | New |
| `rlh_rfis` | New |
| `rlh_files` | New |
| `rlh_filelinks` | New |
| `rlh_projectexpectations` | New |
