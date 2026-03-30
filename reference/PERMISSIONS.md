# Permissions

> Status: Authoritative

This document defines the identity, permission, and privacy model for the combined Microsoft app.

It is authoritative for:

- which Microsoft systems remain the source of truth
- how the shared app should enforce access
- what the app may and may not do with Dataverse and SharePoint data

The exact role matrix can expand over time, but the boundary rules in this document are not optional.

---

## Core Principle

The shared product must use **Microsoft as the authority for identity and permission intent**.

That means:

- users sign in with Microsoft credentials only
- Microsoft-backed groups and roles define the intended audience and permission posture
- Dataverse remains the system of record for business data
- SharePoint remains the system of record for documents and file permissions
- the shared app enforces those permissions on the way in and out
- the shared app must not invent a separate permission universe that can drift away from Microsoft

The right mental model is not "the app decides permissions."

The right mental model is:

- Microsoft defines identity
- Microsoft-backed groups define permission intent
- Dataverse and SharePoint remain the authoritative data and file systems
- the app is a controlled enforcement layer and user experience on top of those systems

---

## Authority Boundaries

### Microsoft Entra ID

Authoritative for:

- authentication
- MFA and sign-in policies
- offboarding and access removal
- coarse audience and role grouping

### Dataverse

Authoritative for:

- business records
- business-record IDs and relationships
- storage of shared project data

Dataverse remains the backend for the shared app. Data does not live in the app.

### SharePoint

Authoritative for:

- file bytes
- document libraries
- document-sharing audiences and library-level access

### Shared app

Responsible for:

- presenting a usable interface
- enforcing Microsoft-aligned access before data is shown or mutated
- shaping Dataverse records into app domain objects
- recording acting-user context on writes

The shared app is **not** the authority for identity, and it must not grant broader access than the Microsoft-backed permission model allows.

---

## Recommended Connection Pattern

The recommended target pattern is:

```text
User signs in with Microsoft
-> shared app receives Microsoft identity and group context
-> shared app server checks allowed access
-> shared app server reads or writes Dataverse
-> shared app returns only permitted data
-> SharePoint continues to govern document access
```

This keeps Dataverse as the backend while avoiding direct browser-to-Dataverse access as the long-term shared architecture.

### Why this is not more risky than the current direct-browser pattern

If implemented correctly, this approach is no more risky than Trevor's current browser-direct Dataverse setup, and it can be safer in several ways:

- the browser no longer receives direct Dataverse access
- Microsoft still governs sign-in, MFA, and offboarding
- the app can deny by default before returning any data
- app routes can apply the same Microsoft-backed audience rules consistently across feature surfaces
- audit stamping can record the acting Microsoft user even when the write is server-side

The risk only increases if the app creates its own independent permission model. That is explicitly not the target design.

---

## Non-Negotiable Rules

- No local usernames or local passwords.
- No separate app-only roles that exceed Microsoft-backed access.
- No route should return project data until server-side permission checks pass.
- No browser component should call Dataverse directly in the target shared architecture.
- No SharePoint file audience should be broader in the app than it is in SharePoint itself.
- No external user should see financial or internal coordination data unless their Microsoft-backed access explicitly allows it.
- Only a human with execution authority may open or close a project gate.
- Canonical org data such as trades, companies, contacts, and reference vocabularies stays tightly controlled.

---

## Role Families

The expected role families are:

- internal builders and PMs
- trade partners
- vendors and suppliers
- clients or owners
- platform or system admins

The full table-by-table matrix can continue to evolve, but these families should be backed by Microsoft groups rather than freeform app-local roles.

---

## Permission Layers

### 1. Microsoft-backed audience layer

This layer answers questions such as:

- is this person internal or external
- is this person a PM, admin, trade partner, vendor, or client
- has this person been offboarded

### 2. Project access layer

This layer answers questions such as:

- which specific projects may this user access
- which company or trade context are they acting within
- which feature areas are available inside those projects

Project-level access records may exist in Dataverse if needed, but they must point back to real Microsoft identities or groups. They are not a substitute for Microsoft identity.

### 3. Resource enforcement layer

This layer applies the rules to:

- Dataverse project data
- SharePoint file and document links
- shared app screens and mutations

---

## Example Outcomes

### Employee leaves the company

- Microsoft account is disabled or removed from the required groups
- the user can no longer sign in to the shared app
- the user also loses the related SharePoint access
- no separate local app account needs to be deactivated

### PM can edit one project but not another

- Microsoft establishes that the user is an internal PM
- project-level access rules determine which projects they may open
- the server returns data only for the projects they are allowed to access

### Trade partner can see execution action items but not costs

- Microsoft establishes that the user is an external trade partner
- project-level access rules limit them to their allowed project and trade context
- the app exposes execution views that belong to that audience
- cost, budget, and internal planning data remain hidden unless explicitly allowed

### Accepted quote assigns a company

- bidding can populate or confirm company assignment automatically
- direct company assignment remains allowed when the builder already knows the company
- permission to view or edit that assignment still follows Microsoft-backed access rules

---

## Dataverse and SharePoint Alignment

The shared app must keep its audience boundaries aligned with Microsoft storage systems:

- Dataverse is the backend for business records
- SharePoint is the backend for files
- the app may link those systems together in the UI
- the project files hub at `/projects/[id]/files` is a convenience layer, not a new permission source
- the app must not use the UI to bypass SharePoint file restrictions
- the app must not expose Dataverse records to audiences that Microsoft-backed project access would deny

This follows the same boundary already established elsewhere in the repo: Dataverse owns business entities and SharePoint owns documents.

---

## Current Implementation vs Target Posture

The checked-in app currently uses a server-side Dataverse client with Azure app credentials in live mode.

The target posture is:

- Microsoft sign-in for the human user
- server-side Dataverse access from the shared app
- Microsoft-backed permission enforcement before data is returned or changed
- audit stamping of the acting Microsoft user on important writes

So the target is not "move data out of Dataverse" and it is not "invent app-local permissions."

The target is:

- keep Dataverse as the backend
- keep SharePoint as the document system
- keep Microsoft as the identity and permission authority
- let the app enforce those boundaries cleanly
