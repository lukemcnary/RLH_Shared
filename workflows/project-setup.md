# Workflow: Project Setup

> Status: Authoritative

This workflow establishes a project before detailed scope, bidding, or sequencing work begins.

---

## Outcome

By the end of project setup:

- the project record exists and routes resolve correctly
- the client relationship and job address are confirmed
- the shared execution classification is understood
- the first pass of spaces exists
- execution participants and external project containers are identified
- the shared system has enough real structure to begin work without inventing downstream records early

---

## Steps

1. Create or confirm the project record.
   Capture the project name, site address, baseline dates, and linked client record.

2. Review the shared gate classifications.
   Start from the shared five-gate vocabulary and confirm it fits how the team intends to talk about the job's execution.

3. Define the initial project spaces.
   Add the rooms or zones that scope details, project scope, and selections will need to reference later.

4. Confirm trade coverage and key contacts.
   Make sure the expected execution-side trades and the people tied to them are known before sequencing starts. If the current compatibility board still needs `ProjectTrade` rows, seed them as simple project-to-trade links for grouping.

5. Create the external project containers.
   Stand up or confirm the SharePoint site, the five canonical project libraries, and any Teams space that will carry files and day-to-day communication around the Dataverse records.

6. Enter the working project through the project home and first planning routes.
   The normal starting path is `/projects/[id]`, followed by the peer planning routes as the scope is structured. The app should surface real project structure here, not force the team to invent financial or execution detail that does not exist yet.

---

## Done When

- the project can be opened from `/projects`
- the PM has a usable space skeleton and clear execution classification language
- the team can begin scope and cost work without inventing setup data or fake downstream records midstream

---

## Related Workflows

- `workflows/scope-and-cost.md`
- `workflows/files.md`
