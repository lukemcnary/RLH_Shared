# System Diagram — Architecture + Domain Model

> Status: Authoritative

This diagram covers the target shared architecture and the target shared domain model.

It intentionally distinguishes:

- target shared tables
- extended Trevor tables that stay in the long-term design
- Trevor compatibility surfaces that may remain during transition

---

## Full System Diagram

```mermaid
graph TB
  subgraph BROWSER["Browser"]
    CB_SEQ["sequencer-board.tsx"]
    CB_DEV["project feature views"]
    CB_OTHER["other feature views"]
  end

  subgraph NEXTJS["Next.js Server"]
    SC["Server Components - thin data fetch"]
    SA["Server Actions - mutations + revalidatePath"]
    ADAPTER["adapter.ts - public import point"]
    DV_QUERIES["lib/dataverse/queries/ - domain normalization"]
    DV_CLIENT["lib/dataverse/client.ts - Azure auth + dvFetch"]
    SP_CLIENT["lib/sharepoint/ - Graph auth + file orchestration"]
    SC --> ADAPTER
    ADAPTER --> DV_QUERIES
    DV_QUERIES --> DV_CLIENT
    ADAPTER --> SP_CLIENT
    SA --> DV_CLIENT
    SA --> SP_CLIENT
  end

  subgraph MICROSOFT["Microsoft Platform"]
    subgraph DATAVERSE["Dataverse - business records"]
      DV_TARGET["Target shared tables<br/>Planning/commercial: rlh_spaces, rlh_scopedetails, rlh_scopeitems, rlh_costitems, rlh_selections, rlh_bidpackages, rlh_quotes<br/>Execution/admin: rlh_tasks, rlh_changeorders, rlh_rfis, rlh_files, rlh_filelinks, rlh_projectexpectations<br/>Org + shared vocab: rlh_knowledgeentries, rlh_expectations, rlh_capabilities, rlh_costcodes, rlh_clients<br/>Company/contact/project relationship tables: rlh_companytypes, rlh_contactroles, rlh_projectcontacts, rlh_company_companytypes, rlh_company_tradetypes, rlh_company_capabilities<br/>+ scope/cost/bidding/selection junction tables"]
      DV_EXTENDED["Extended existing tables<br/>cr6cd_projects<br/>cr6cd_mobilizations<br/>cr6cd_trades<br/>accounts<br/>contacts"]
      DV_COMPAT["Compatibility surfaces<br/>cr6cd_buildphases, cr6cd_gatedeclarationsjson<br/>cr6cd_stepsjson, cr6cd_markersjson<br/>cr6cd_mobilizationmarkerses<br/>rlh_projecttrades, rlh_tradescopes<br/>rlh_tradeitems, rlh_tradetemplates"]
    end
    SHAREPOINT["SharePoint - file bytes + library metadata"]
    ENTRA["Microsoft Entra ID<br/>identity + permission intent"]
  end

  subgraph TREVOR_APP["Trevor App - Peer"]
    TREVOR["Current Trevor execution app"]
  end

  BROWSER -- "props down" --> SC
  BROWSER -- "mutations up" --> SA
  BROWSER -. "user sign-in" .-> ENTRA
  DV_CLIENT -- "OData REST API" --> DATAVERSE
  SP_CLIENT -- "Microsoft Graph / SharePoint APIs" --> SHAREPOINT
  TREVOR -- "OData REST API" --> DATAVERSE
  ENTRA -. "server-side auth + permission context" .-> DV_CLIENT
  ENTRA -. "server-side auth + permission context" .-> SP_CLIENT
  DATAVERSE -. "file metadata + record links" .-> SHAREPOINT
```

---

## Domain Model — Object Relationships

This is an object-relationship view of the target shared domain.

It intentionally shows the major record tables and how they relate. It does **not** try to reproduce UI groupings, workflow stages, or every schema-level junction table.

```mermaid
graph LR
  TRADE_TYPES["Trade Types"]
  CAPABILITIES["Capabilities"]
  COST_CODES["Cost Codes"]
  KNOWLEDGE["Knowledge Entries"]
  EXPECTATIONS["Expectations"]
  COMPANIES["Companies"]
  COMPANY_TYPES["Company Types"]
  CONTACTS["Contacts"]
  CONTACT_ROLES["Contact Roles"]
  PROJECT_CONTACTS["Project Contacts"]
  CLIENTS["Clients / Leads"]

  PROJECTS["Projects"]
  SPACES["Spaces"]
  SCOPE_DETAILS["Scope Details"]
  SCOPE_ITEMS["Project Scope"]
  COST_ITEMS["Cost Items"]
  SELECTIONS["Selections"]
  BID_PACKAGES["Bid Packages"]
  QUOTES["Quotes"]
  MOBILIZATIONS["Mobilizations"]
  TASKS["Action Items"]
  CHANGE_ORDERS["Change Orders"]
  RFIS["RFIs"]
  FILES["Files"]
  FILE_LINKS["File Links"]
  PROJECT_EXPECTATIONS["Project Expectations"]

  CAPABILITIES --> TRADE_TYPES
  COMPANIES -. "have type" .-> COMPANY_TYPES
  COMPANIES -. "offer" .-> TRADE_TYPES
  COMPANIES -. "offer" .-> CAPABILITIES
  COMPANIES --> CONTACTS
  CONTACTS -. "may have" .-> CONTACT_ROLES
  PROJECTS --> PROJECT_CONTACTS
  PROJECT_CONTACTS --> CONTACTS
  CLIENTS -. "may become" .-> PROJECTS
  KNOWLEDGE -. "can be scoped to" .-> PROJECTS

  PROJECTS --> SPACES
  PROJECTS --> SCOPE_DETAILS
  PROJECTS --> SCOPE_ITEMS
  PROJECTS --> COST_ITEMS
  PROJECTS --> SELECTIONS
  PROJECTS --> BID_PACKAGES
  PROJECTS --> QUOTES
  PROJECTS --> MOBILIZATIONS
  PROJECTS --> TASKS
  PROJECTS --> CHANGE_ORDERS
  PROJECTS --> RFIS
  PROJECTS --> FILES
  PROJECTS --> PROJECT_EXPECTATIONS

  SCOPE_DETAILS -. "may link to" .-> SPACES
  SCOPE_DETAILS --> SCOPE_ITEMS
  SCOPE_ITEMS --> TRADE_TYPES
  SCOPE_ITEMS -. "may apply to" .-> SPACES
  SCOPE_ITEMS -. "may produce" .-> COST_ITEMS
  SCOPE_ITEMS -. "can seed" .-> TASKS
  COST_ITEMS --> COST_CODES
  COST_ITEMS --> TRADE_TYPES
  COST_ITEMS -. "may apply to" .-> SPACES
  SELECTIONS -. "may affect" .-> COST_ITEMS
  SELECTIONS -. "may apply to" .-> SPACES
  BID_PACKAGES --> TRADE_TYPES
  BID_PACKAGES --> QUOTES
  BID_PACKAGES -. "group" .-> SCOPE_ITEMS
  BID_PACKAGES -. "may price" .-> COST_ITEMS
  QUOTES --> COMPANIES
  QUOTES -. "may price" .-> COST_ITEMS
  MOBILIZATIONS --> TRADE_TYPES
  MOBILIZATIONS --> TASKS
  MOBILIZATIONS -. "may assign" .-> COMPANIES
  TASKS --> TRADE_TYPES
  TASKS -. "may link" .-> SCOPE_ITEMS
  TASKS -. "may link" .-> COST_ITEMS
  FILES --> FILE_LINKS
  PROJECT_EXPECTATIONS --> EXPECTATIONS

  classDef shared fill:#fff7dd,stroke:#d7bc60,color:#433400;
  classDef people fill:#f5f0ff,stroke:#b8a0d9,color:#33224d;
  classDef project fill:#eef4ff,stroke:#8fa9d9,color:#1f2d3d;

  class TRADE_TYPES,CAPABILITIES,COST_CODES,KNOWLEDGE,EXPECTATIONS,CLIENTS shared;
  class COMPANIES,COMPANY_TYPES,CONTACTS,CONTACT_ROLES,PROJECT_CONTACTS people;
  class PROJECTS,SPACES,SCOPE_DETAILS,SCOPE_ITEMS,COST_ITEMS,SELECTIONS,BID_PACKAGES,QUOTES,MOBILIZATIONS,TASKS,CHANGE_ORDERS,RFIS,FILES,FILE_LINKS,PROJECT_EXPECTATIONS project;
```

---

## Domain Model — Simplified Overview

```mermaid
graph LR
  PROJECTS["Projects"] --> SPACES["Spaces"]
  PROJECTS --> SCOPE_DETAILS["Scope Details"]
  SCOPE_DETAILS --> SCOPE_ITEMS["Project Scope"]
  SCOPE_ITEMS -. "may produce" .-> COST_ITEMS["Cost Items"]
  SELECTIONS["Selections"] -. "may affect" .-> COST_ITEMS
  SCOPE_ITEMS -. "grouped in" .-> BID_PACKAGES["Bid Packages"]
  BID_PACKAGES --> QUOTES["Quotes"]
  PROJECTS --> MOBILIZATIONS["Mobilizations"]
  SCOPE_ITEMS -. "can seed" .-> TASKS["Action Items"]
  MOBILIZATIONS --> TASKS
  PROJECTS --> FILES["Files"]
  FILES --> FILE_LINKS["File Links"]
  PROJECTS --> PROJECT_EXPECTATIONS["Project Expectations"]
  PROJECT_EXPECTATIONS --> EXPECTATIONS["Expectations"]
```

---

## Notes For Visio Conversion

If you are building this in Visio:

1. Top section: Browser, Next.js server, Dataverse, SharePoint, Trevor app as peer.
2. Show both the Dataverse query/client path and the SharePoint/Graph file path on the server side.
3. Show Microsoft Entra ID as the identity and permission-intent source, with the shared app enforcing that access on the server side.
4. In Dataverse, split the storage area into three zones: target shared tables, extended existing tables, and compatibility surfaces.
5. In the domain model, show actual record tables and their key relationships. Do not group them into faux workflow containers like "Project Setup" or "Bidding."
6. Keep `Projects` visually central, with shared records and company/people records around the project-scoped records.
7. If you need to show compatibility surfaces, keep them visually separate from the core domain-object view.
